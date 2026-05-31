import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Get the most recent non-ended round
    const { data: round } = await supabase
      .from('rounds')
      .select('*')
      .is('endedAt', null)
      .order('roundNumber', { ascending: false })
      .limit(1)
      .single()

    if (!round) {
      // No active round — send WAITING with nextRoundAt if available
      const { data: lastRound } = await supabase
        .from('rounds')
        .select('endedAt')
        .order('roundNumber', { ascending: false })
        .limit(1)
        .single()

      const nextRoundAt = lastRound?.endedAt
        ? new Date(lastRound.endedAt).getTime() + 8000
        : Date.now() + 5000

      return NextResponse.json({
        phase: 'WAITING',
        nextRoundAt,
        roundId: null,
        roundNumber: 0,
        hash: null,
        multiplier: 1.0,
        multiplierHistory: [],
        phaseEndsAt: null,
        outcomeColor: null,
      })
    }

    // Return current live round state
    return NextResponse.json({
      phase: round.phase,
      roundId: round.id,
      roundNumber: round.roundNumber,
      hash: round.hash,
      multiplier: round.currentMultiplier ?? 1.0,
      phaseEndsAt: round.phaseEndsAt ? new Date(round.phaseEndsAt).getTime() : null,
      outcomeColor: round.outcomeColor ?? null,
      crashMultiplier: round.crashMultiplier ?? null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}