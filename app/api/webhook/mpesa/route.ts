import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const callback = body?.Body?.stkCallback

  if (!callback) return NextResponse.json({ received: true })

  const { CheckoutRequestID, ResultCode } = callback

  const supabase = createServerSupabase()

  if (ResultCode === 0) {
    const items = callback.CallbackMetadata?.Item || []
    const get = (name: string) => items.find((i: any) => i.Name === name)?.Value

    const amount = get('Amount')
    const receipt = get('MpesaReceiptNumber')

    const { data: tx } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', CheckoutRequestID)
      .single()

    if (tx && tx.status === 'PENDING') {
      await supabase
        .from('transactions')
        .update({ status: 'SUCCESS', reference: receipt })
        .eq('reference', CheckoutRequestID)

      await supabase.rpc('increment_balance', {
        user_id: tx.user_id,
        amount: tx.amount,
      })
    }
  } else {
    await supabase
      .from('transactions')
      .update({ status: 'FAILED' })
      .eq('reference', CheckoutRequestID)
  }

  return NextResponse.json({ received: true })
}