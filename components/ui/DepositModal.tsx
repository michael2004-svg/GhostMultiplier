'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { User } from '@/types/user'

interface DepositModalProps {
  user: User
  onClose: () => void
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) return `254${cleaned.slice(1)}`
  if (cleaned.startsWith('254')) return cleaned
  return `254${cleaned}`
}

export default function DepositModal({ user, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState(1000)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [step, setStep] = useState<'form' | 'waiting' | 'done'>('form')
  const [loading, setLoading] = useState(false)

  async function handleDeposit() {
    if (amount < 10) { toast.error('Minimum deposit is 10 KES'); return }
    if (!phone) { toast.error('Enter your M-Pesa number'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phoneNumber: formatPhone(phone),
          userId: user.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Deposit failed')

      setStep('waiting')

      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/wallet/status/${data.checkoutRequestId}`)
          const status = await statusRes.json()
          if (status.status === 'completed') {
            clearInterval(interval)
            setStep('done')
            toast.success(`${amount.toLocaleString()} KES added!`)
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            clearInterval(interval)
            setLoading(false)
            setStep('form')
            toast.error('Payment failed or cancelled')
          }
        } catch {}
      }, 5000)
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-70" onClick={onClose} />
      <div className="relative bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl"
        >
          ✕
        </button>

        {step === 'form' && (
          <>
            <h2 className="text-xl font-black mb-6">Deposit via M-Pesa</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                  Amount (KES)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#1A0000] border border-[#333] rounded-xl px-4 py-3 text-white font-bold text-xl text-center focus:outline-none focus:border-nk-gold"
                  min={10}
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className="flex-1 py-2 bg-[#1A0000] border border-[#333] rounded-lg text-sm font-bold text-gray-400 hover:border-nk-gold hover:text-nk-gold transition-colors"
                    >
                      {a >= 1000 ? `${a / 1000}K` : a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">
                  M-Pesa Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#1A0000] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-nk-gold"
                  placeholder="0712345678"
                />
              </div>
              <button
                onClick={handleDeposit}
                disabled={loading}
                className="btn-place-bet w-full py-4 rounded-xl font-black text-lg text-white disabled:opacity-50"
              >
                {loading ? 'Processing...' : `PAY ${amount.toLocaleString()} KES`}
              </button>
            </div>
          </>
        )}

        {step === 'waiting' && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4 animate-pulse">📱</div>
            <h3 className="text-xl font-black mb-2">Check Your Phone</h3>
            <p className="text-gray-400 text-sm">
              Enter your M-Pesa PIN to complete the{' '}
              <span className="text-nk-gold font-bold">{amount.toLocaleString()} KES</span> deposit
            </p>
            <div className="mt-4 flex gap-1 justify-center">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-nk-gold rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-black text-nk-green mb-2">Deposit Successful!</h3>
            <p className="text-gray-400">{amount.toLocaleString()} KES added to your balance</p>
            <button
              onClick={onClose}
              className="btn-place-bet mt-6 px-8 py-3 rounded-xl font-bold text-white"
            >
              PLAY NOW
            </button>
          </div>
        )}
      </div>
    </div>
  )
}