import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/mpesa'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { checkoutRequestId: string } }
) {
  const { checkoutRequestId } = params

  try {
    const status = await checkPaymentStatus(checkoutRequestId)

    if (status.status === 'completed') {
      const supabase = createServerSupabase()

      // Get transaction
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', checkoutRequestId)
        .single()

      if (tx && tx.status === 'PENDING') {
        // Update transaction
        await supabase
          .from('transactions')
          .update({ status: 'SUCCESS' })
          .eq('reference', checkoutRequestId)

        // Update balance
        await supabase.rpc('increment_balance', {
          user_id: tx.user_id,
          amount: tx.amount,
        })
      }
    }

    return NextResponse.json(status)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}