import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/mpesa'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { checkoutRequestId: string } }
) {
  const { checkoutRequestId } = params

  try {
    const status = await checkPaymentStatus(checkoutRequestId)

    if (status.status === 'completed') {
      const supabase = createServiceClient()

      // Idempotent: only credit once — check current status first
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', checkoutRequestId)
        .single()

      if (tx && tx.status === 'PENDING') {
        // Mark transaction as SUCCESS first (prevents race condition double-credit)
        const { error: updateErr } = await supabase
          .from('transactions')
          .update({ status: 'SUCCESS', mpesa_receipt: status.mpesaReceiptNumber ?? null })
          .eq('reference', checkoutRequestId)
          .eq('status', 'PENDING') // only update if still PENDING (optimistic lock)

        if (!updateErr) {
          // Only increment balance if we successfully flipped status
          const { error: rpcErr } = await supabase.rpc('increment_balance', {
            user_id: tx.user_id,
            amount: tx.amount,
          })

          if (rpcErr) {
            // Balance increment failed — roll back transaction status
            await supabase
              .from('transactions')
              .update({ status: 'PENDING' })
              .eq('reference', checkoutRequestId)
            console.error('Balance increment failed:', rpcErr)
          }
        }
      }
    }

    return NextResponse.json(status)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}