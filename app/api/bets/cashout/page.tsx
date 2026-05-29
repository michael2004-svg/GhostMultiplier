import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId, roundId, currentMultiplier } = await req.json()

  const supabase = createServerSupabase()

  const { data: round } = await supabase
    .from('rounds')
    .select('phase')
    .eq('id', roundId)
    .single()

  if (!round || !['MULTIPLIER', 'LOCK'].includes(round.phase)) {
    return NextResponse.json({ error: 'Cannot cash out now' }, { status: 400 })
  }

  const { data: bet } = await supabase
    .from('bets')
    .select('*')
    .eq('round_id', roundId)
    .eq('user_id', userId)
    .is('cashout_at', null)
    .single()

  if (!bet) return NextResponse.json({ error: 'No active bet' }, { status: 400 })

  const cashoutAmount = Math.floor(bet.amount * currentMultiplier)
  const profit = cashoutAmount - bet.amount

  await supabase
    .from('bets')
    .update({
      cashout_at: currentMultiplier,
      cashout_amount: cashoutAmount,
      outcome: 'CASHOUT',
      profit,
    })
    .eq('id', bet.id)

  await supabase.rpc('increment_balance', { user_id: userId, amount: cashoutAmount })
  await supabase.rpc('add_xp', { user_id: userId, xp: 50 })

  return NextResponse.json({ cashoutAmount, multiplier: currentMultiplier })
}