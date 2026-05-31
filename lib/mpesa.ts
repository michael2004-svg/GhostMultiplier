const NEXUS_SECRET_KEY = process.env.NEXUS_SECRET_KEY!
const NEXUS_BASE_URL = 'https://pay.makamesco-tech.co.ke'

export async function triggerSTKPush(params: {
  phoneNumber: string
  amount: number
  accountReference: string
  transactionDesc: string
}): Promise<{ checkoutRequestId: string; transactionId: number }> {
  const response = await fetch(`${NEXUS_BASE_URL}/api/payments/stkpush`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': NEXUS_SECRET_KEY,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'STK Push failed')
  }

  return response.json()
}

export async function checkPaymentStatus(checkoutRequestId: string): Promise<{
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  mpesaReceiptNumber?: string
  amount?: string
  phoneNumber?: string
}> {
  const response = await fetch(
    `${NEXUS_BASE_URL}/api/payments/status/${checkoutRequestId}`,
    {
      headers: { 'X-API-Key': NEXUS_SECRET_KEY },
      // Short cache to prevent hammering the payment provider
      next: { revalidate: 0 },
    } as RequestInit
  )

  if (!response.ok) {
    throw new Error('Status check failed')
  }

  return response.json()
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`
  if (cleaned.startsWith('254')) return cleaned
  return `254${cleaned}`
}