import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId, roundId, amount, colorChoice } = await req.json()

  const supabase = createServerSupabase()

  // Check balance
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single()

  if (!user || user.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  // Check round is in BETTING phase
  const { data: round } = await supabase
    .from('rounds')
    .select('phase')
    .eq('id', roundId)
    .single()

  if (!round || round.phase !== 'BETTING') {
    return NextResponse.json({ error: 'Betting phase ended' }, { status: 400 })
  }

  // Check no duplicate bet
  const { data: existing } = await supabase
    .from('bets')
    .select('id')
    .eq('round_id', roundId)
    .eq('user_id', userId)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already bet this round' }, { status: 400 })
  }

  // Deduct balance
  await supabase.rpc('decrement_balance', { user_id: userId, amount })

  // Record bet
  const { data: bet } = await supabase
    .from('bets')
    .insert({ round_id: roundId, user_id: userId, amount, color_choice: colorChoice })
    .select()
    .single()

  // Update total wagered
  await supabase.rpc('increment_wagered', { user_id: userId, amount })

  return NextResponse.json({ bet })
}