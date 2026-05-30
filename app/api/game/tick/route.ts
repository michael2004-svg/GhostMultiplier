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

  console.log('[CRON] ✅ Auth passed')

  const supabase = createServiceClient()

  // Check env vars
  console.log('[CRON] SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('[CRON] SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.log('[CRON] APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

  // Guard: don't start if round already running
  const { data: activeRound, error: activeError } = await supabase
    .from('rounds')
    .select('id, phase')
    .not('phase', 'in', '("RESOLUTION","IDLE")')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  console.log('[CRON] Active round check:', { activeRound, activeError })

  if (activeRound) {
    console.log('[CRON] Skipping — round already running:', activeRound)
    return NextResponse.json({ ok: true, skipped: 'round already running' })
  }

  // Subscribe to broadcast channel
  console.log('[CRON] Subscribing to broadcast channel...')
  const broadcastChannel = supabase.channel('game')
  
  const subscribeResult = await Promise.race([
    new Promise<string>((resolve) => {
      broadcastChannel.subscribe((status) => {
        console.log('[CRON] Channel status:', status)
        if (status === 'SUBSCRIBED') resolve('ok')
      })
    }),
    new Promise<string>((resolve) => setTimeout(() => resolve('timeout'), 8000)),
  ])

  console.log('[CRON] Subscribe result:', subscribeResult)

  if (subscribeResult === 'timeout') {
    return NextResponse.json({ error: 'Channel subscribe timeout' }, { status: 500 })
  }

  // Insert round
  console.log('[CRON] Inserting round into DB...')
  const serverSeed = generateServerSeed()
  const clientSeed = generateClientSeed()
  const roundNumber = Date.now()
  const { color, multiplier: maxMultiplier } = generateRoundOutcome(serverSeed, clientSeed, String(roundNumber))
  const hash = hashSeeds(serverSeed, clientSeed)

  const { data: round, error: insertError } = await supabase
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

  console.log('[CRON] Round insert result:', { round: round?.id, insertError })

  if (!round) {
    return NextResponse.json({ error: 'Round insert failed', detail: insertError }, { status: 500 })
  }

  // Broadcast round:start
  const broadcastResult = await broadcastChannel.send({
    type: 'broadcast',
    event: 'round:start',
    payload: {
      roundId: round.id,
      roundNumber,
      hash,
      phase: 'BETTING',
      phaseEndsAt: Date.now() + 3000,
      maxMultiplier,
    },
  })
  console.log('[CRON] round:start broadcast result:', broadcastResult)

  // Return early with the round info so we can confirm this far works
  return NextResponse.json({
    ok: true,
    debug: true,
    roundId: round.id,
    color,
    maxMultiplier,
    broadcastResult,
  })
}