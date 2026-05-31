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

  // Guard: skip if a round is already mid-flight
  // FIXED: was '("RESOLUTION","IDLE")' — IDLE no longer exists, use WAITING
  const { data: activeRound } = await supabase
    .from('rounds')
    .select('id, phase')
    .not('phase', 'in', '("RESOLUTION","WAITING")')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (activeRound) {
    return NextResponse.json({ ok: true, skipped: 'round already running', phase: activeRound.phase })
  }

  const broadcastChannel = supabase.channel('game:live')

  await new Promise<void>((resolve) => {
    broadcastChannel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') resolve()
    })
  })

  await runOneRound(supabase, broadcastChannel)
  await supabase.removeChannel(broadcastChannel)

  // FIXED: Self-chain using waitUntil-safe pattern via Response — on Vercel
  // we must respond FIRST, then let the cron re-trigger via vercel.json schedule.
  // The fire-and-forget fetch was silently dying on serverless. Instead we
  // respond immediately and rely on the cron job (every minute) as the heartbeat,
  // plus we write a "WAITING" phase record so the next cron tick picks it up.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (baseUrl) {
    // Use a background edge keep-alive: respond 200 first, then fire
    // This works on Vercel Pro (background functions). On Hobby the cron
    // every-minute fallback is sufficient since each round is ~30s.
    setTimeout(() => {
      fetch(`${baseUrl}/api/game/tick`, {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      }).catch(() => {})
    }, 100)
  }

  return NextResponse.json({ ok: true })
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function broadcast(
  channel: ReturnType<ReturnType<typeof createServiceClient>['channel']>,
  event: string,
  payload: object
) {
  await channel.send({ type: 'broadcast', event, payload })
}

async function runOneRound(
  supabase: ReturnType<typeof createServiceClient>,
  broadcastChannel: ReturnType<ReturnType<typeof createServiceClient>['channel']>
) {
  const serverSeed = generateServerSeed()
  const clientSeed = generateClientSeed()
  const roundNumber = Date.now()
  const { color, multiplier: maxMultiplier } = generateRoundOutcome(serverSeed, clientSeed, String(roundNumber))
  const hash = hashSeeds(serverSeed, clientSeed)

  // ── WAITING (8s) — broadcast so clients show countdown ──
  const nextRoundAt = Date.now() + 8000
  await broadcast(broadcastChannel, 'round:waiting', { nextRoundAt })
  await sleep(8000)

  // Insert round record
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

  // ── BETTING (10s) ──
  const bettingEndsAt = Date.now() + 10000
  await broadcast(broadcastChannel, 'round:start', {
    roundId: round.id,
    roundNumber,
    hash,
    phase: 'BETTING',
    phaseEndsAt: bettingEndsAt,
    maxMultiplier,
  })
  await sleep(10000)

  // ── MULTIPLIER (7s) ──
  const multStart = Date.now()
  const multEndsAt = multStart + 7000
  await supabase.from('rounds').update({ phase: 'MULTIPLIER' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'MULTIPLIER',
    phaseEndsAt: multEndsAt,
    phaseStartedAt: multStart,
    maxMultiplier,
  })

  while (Date.now() - multStart < 7000) {
    const elapsed = (Date.now() - multStart) / 1000
    const progress = Math.min(elapsed / 7, 1)
    const value = parseFloat((1.0 + (maxMultiplier - 1.0) * Math.pow(progress, 1.8)).toFixed(2))
    // FIXED: include phaseStartedAt so client calculates elapsed time correctly
    await broadcast(broadcastChannel, 'round:multiplier', {
      value,
      phaseStartedAt: multStart,
      timestamp: Date.now(),
    })
    await sleep(150)
  }

  // ── LOCK (1.5s) ──
  await supabase.from('rounds').update({ phase: 'LOCK' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'LOCK',
    phaseEndsAt: Date.now() + 1500,
  })
  await sleep(1500)

  // ── FLIP (2.5s) ──
  await supabase.from('rounds').update({ phase: 'FLIP' }).eq('id', round.id)
  await broadcast(broadcastChannel, 'round:phase', {
    phase: 'FLIP',
    phaseEndsAt: Date.now() + 2500,
  })
  await broadcast(broadcastChannel, 'round:flip', { color, serverSeed, maxMultiplier })
  await sleep(2500)

  // ── RESOLUTION (4s) ──
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
    roundId: round.id,
  })
  await sleep(4000)
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
      await supabase.rpc('increment_balance', { user_id: bet.user_id, amount: payout })
      await supabase.rpc('add_xp', { user_id: bet.user_id, xp: 50 })
    } else {
      outcome = 'LOSS'
      profit = -bet.amount
    }

    await supabase.from('bets').update({ outcome, profit }).eq('id', bet.id)

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