import { NextRequest, NextResponse } from 'next/server'
import { triggerSTKPush } from '@/lib/mpesa'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId, amount, phoneNumber } = await req.json()

  if (!userId || !amount || !phoneNumber) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (amount < 10 || amount > 500000) {
    return NextResponse.json({ error: 'Amount must be between 10 and 500,000 KES' }, { status: 400 })
  }

  try {
    const result = await triggerSTKPush({
      phoneNumber,
      amount,
      accountReference: `NK-${userId.slice(0, 8).toUpperCase()}`,
      transactionDesc: 'Nairobi King Deposit',
    })

    // Record pending transaction
    const supabase = createServerSupabase()
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'DEPOSIT',
      amount,
      reference: result.checkoutRequestId,
      status: 'PENDING',
    })

    return NextResponse.json({ checkoutRequestId: result.checkoutRequestId })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}