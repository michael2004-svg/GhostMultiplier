import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

const TOKEN_COSTS: Record<string, number> = {
  PEEK: 5,
  SHIELD: 10,
  DOUBLE_DOWN: 20,
}

export async function POST(req: NextRequest) {
  const { userId, roundId, tokenType } = await req.json()

  const cost = TOKEN_COSTS[tokenType]
  if (!cost) return NextResponse.json({ error: 'Invalid token type' }, { status: 400 })

  const supabase = createServerSupabase()

  // Check balance
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single()

  if (!user || user.balance < cost) {
    return NextResponse.json({ error: 'Insufficient balance for token' }, { status: 400 })
  }

  // Check round is active
  const { data: round } = await supabase
    .from('rounds')
    .select('phase')
    .eq('id', roundId)
    .single()

  if (!round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  // DOUBLE_DOWN only in LOCK phase
  if (tokenType === 'DOUBLE_DOWN' && round.phase !== 'LOCK') {
    return NextResponse.json({ error: 'Double Down only available in Lock phase' }, { status: 400 })
  }

  // Deduct cost
  await supabase.rpc('decrement_balance', { user_id: userId, amount: cost })

  // If DOUBLE_DOWN — double the bet
  if (tokenType === 'DOUBLE_DOWN') {
    const { data: bet } = await supabase
      .from('bets')
      .select('*')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single()

    if (bet) {
      const extra = bet.amount
      const { data: freshUser } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single()

      if (freshUser && freshUser.balance >= extra) {
        await supabase.rpc('decrement_balance', { user_id: userId, amount: extra })
        await supabase
          .from('bets')
          .update({ amount: bet.amount * 2 })
          .eq('id', bet.id)
      }
    }
  }

  // Record token purchase
  await supabase.from('token_purchases').insert({
    user_id: userId,
    round_id: roundId,
    token_type: tokenType,
    cost,
  })

  return NextResponse.json({ success: true, tokenType, cost })
}