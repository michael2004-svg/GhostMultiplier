import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  generateRoundOutcome,
  generateServerSeed,
  generateClientSeed,
  hashSeeds,
} from '@/lib/rng'

export const maxDuration = 60

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Guard: don't start a new round if one is already running
  const { data: activeRound } = await supabase
    .from('rounds')
    .select('id')
    .not('phase', 'in', '("RESOLUTION","IDLE")')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (activeRound) {
    return NextResponse.json({ ok: true, skipped: 'round already running' })
  }

  const broadcastChannel = supabase.channel('game')
  await new Promise<void>((resolve) => {
    broadcastChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') resolve()
    })
  })

  // Run one full round (~14s — well within 30s cron timeout)
  await runOneRound(supabase, broadcastChannel)
  await supabase.removeChannel(broadcastChannel)

  // Self-ping to chain the next round immediately without waiting for next cron tick
  // The cron itself is the safety net if this ping ever fails
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (baseUrl) {
    fetch(`${baseUrl}/api/cron/game`, {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function broadcast(
  broadcastChannel: ReturnType<ReturnType<typeof createServiceClient>['channel']>,
  event: string,
  payload: object
) {
  await broadcastChannel.send({
    type: 'broadcast',
    event,
    payload,
  })
}

async function runOneRound(
  supabase: ReturnType<typeof createServiceClient>,
  broadcastChannel: ReturnType<ReturnType<typeof createServiceClient>['channel']>
) {
  const serverSeed = generateServerSeed()
  const clientSeed = generateClientSeed()
  const roundNumber = Date.now()

  const { color, multiplier: maxMultiplier } = generateRoundOutcome(
    serverSeed,
    clientSeed,
    String(roundNumber)
  )

  const hash = hashSeeds(serverSeed, clientSeed)

  const { data: round } = await supabase
    .from('rounds')
    .insert({
      round_number: roundNumber,
      client_seed: clientSeed,
      hash,
      phase: 'BETTING',
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (!round) return

  // ── BETTING PHASE (3s) ──
  await broadcast(broadcastChannel, 'round:start', {
    roundId: round.id,
    roundNumber,
    hash,
    phase: 'BETTING',
    phaseEndsAt: Date.now() + 3000,
    maxMultiplier,
  })
  await sleep(3000)

  // ── MULTIPLIER PHASE (5s) ──
  await supabase.from('rounds').update({ phase: 'MULTIPLIER' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'MULTIPLIER',
    phaseEndsAt: Date.now() + 5000,
    maxMultiplier,
  })

  const tickStart = Date.now()
  while (Date.now() - tickStart < 5000) {
    const elapsed = (Date.now() - tickStart) / 1000
    const progress = Math.min(elapsed / 5, 1)
    const value = parseFloat(
      (1.0 + (maxMultiplier - 1.0) * Math.pow(progress, 1.8)).toFixed(2)
    )
    await broadcast(broadcastChannel, 'round:multiplier', { value, timestamp: Date.now() })
    await sleep(200)
  }

  // ── LOCK PHASE (1s) ──
  await supabase.from('rounds').update({ phase: 'LOCK' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'LOCK',
    phaseEndsAt: Date.now() + 1000,
  })
  await sleep(1000)

  // ── FLIP PHASE (2s) ──
  await supabase.from('rounds').update({ phase: 'FLIP' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'FLIP',
    phaseEndsAt: Date.now() + 2000,
  })
  await broadcast(broadcastChannel, 'round:flip', {
    color,
    serverSeed,
    maxMultiplier,
  })
  await sleep(2000)

  // ── RESOLUTION PHASE (3s) ──
  await supabase
    .from('rounds')
    .update({
      phase: 'RESOLUTION',
      outcome_color: color,
      crash_multiplier: maxMultiplier,
      server_seed: serverSeed,
      ended_at: new Date().toISOString(),
    })
    .eq('id', round.id)

  await resolveBets(supabase, broadcastChannel, round.id, color, maxMultiplier)

  await broadcast(broadcastChannel, 'round:end', {
    outcome: { color, multiplier: maxMultiplier },
    nextRoundIn: 3000,
  })
  await sleep(3000)
}

async function resolveBets(
  supabase: ReturnType<typeof createServiceClient>,
  broadcastChannel: ReturnType<ReturnType<typeof createServiceClient>['channel']>,
  roundId: string,
  color: string,
  maxMultiplier: number
) {
  const { data: bets } = await supabase
    .from('bets')
    .select('*')
    .eq('round_id', roundId)
    .is('outcome', null)

  if (!bets?.length) return

  for (const bet of bets) {
    let outcome: string
    let profit: number

    if (color === 'JOKER') {
      outcome = 'JOKER'
      profit = -bet.amount
    } else if (bet.color_choice === color) {
      const payout = Math.floor(bet.amount * maxMultiplier)
      profit = payout - bet.amount
      outcome = 'WIN'
      await supabase.rpc('increment_balance', {
        user_id: bet.user_id,
        amount: payout,
      })
      await supabase.rpc('add_xp', { user_id: bet.user_id, xp: 50 })
    } else {
      outcome = 'LOSS'
      profit = -bet.amount
    }

    await supabase
      .from('bets')
      .update({ outcome, profit })
      .eq('id', bet.id)

    const { data: user } = await supabase
      .from('users')
      .select('username, avatar_url, vip_level')
      .eq('id', bet.user_id)
      .single()

    await broadcastChannel.send({
      type: 'broadcast',
      event: 'feed:update',
      payload: {
        userId: bet.user_id,
        username: user?.username ?? 'Player',
        avatarUrl: user?.avatar_url,
        vipLevel: user?.vip_level,
        action: outcome,
        amount: bet.amount,
        color: bet.color_choice,
        profit,
        timestamp: Date.now(),
      },
    })
  }
}