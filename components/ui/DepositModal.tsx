'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
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

const QUICK_AMOUNTS = [100, 500, 1000, 2000, 5000]
const POLL_INTERVAL = 4000   // Poll every 4 seconds
const MAX_POLL_TIME = 120000 // 2 minutes max

export default function DepositModal({ user, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState(1000)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [step, setStep] = useState<'form' | 'waiting' | 'done' | 'failed'>('form')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [checkoutId, setCheckoutId] = useState<string | null>(null)
  const [elapsedSecs, setElapsedSecs] = useState(0)

  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const elapsedRef = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
      clearAllTimers()
    }
  }, [])

  function clearAllTimers() {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (elapsedRef.current) clearInterval(elapsedRef.current)
  }

  const startPolling = useCallback((cid: string, depositAmount: number) => {
    let attempts = 0
    const maxAttempts = MAX_POLL_TIME / POLL_INTERVAL

    // Elapsed seconds display
    elapsedRef.current = setInterval(() => {
      if (isMounted.current) setElapsedSecs((s) => s + 1)
    }, 1000)

    pollRef.current = setInterval(async () => {
      if (!isMounted.current) return
      attempts++

      try {
        const res = await fetch(`/api/wallet/status/${cid}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.status === 'completed') {
          clearAllTimers()
          if (isMounted.current) {
            setStep('done')
            toast.success(`✅ ${depositAmount.toLocaleString()} KES added to your balance!`, { duration: 5000 })
          }
        } else if (data.status === 'failed' || data.status === 'cancelled') {
          clearAllTimers()
          if (isMounted.current) {
            setStep('failed')
            toast.error(data.status === 'cancelled' ? 'Payment was cancelled' : 'Payment failed')
          }
        }
      } catch {
        // Network hiccup — keep polling
      }

      if (attempts >= maxAttempts && isMounted.current) {
        clearAllTimers()
        setStep('failed')
        toast.error('Payment confirmation timed out. Contact support if amount was deducted.')
      }
    }, POLL_INTERVAL)
  }, [])

  async function handleDeposit() {
    if (amount < 10) { toast.error('Minimum deposit is 10 KES'); return }
    if (!phone) { toast.error('Enter your M-Pesa number'); return }

    setLoading(true)
    setElapsedSecs(0)

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
      if (!res.ok) throw new Error(data.error ?? 'Deposit initiation failed')

      setCheckoutId(data.checkoutRequestId)
      setStep('waiting')
      setLoading(false)
      startPolling(data.checkoutRequestId, amount)
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong')
      setLoading(false)
    }
  }

  function handleRetry() {
    clearAllTimers()
    setStep('form')
    setElapsedSecs(0)
    setCheckoutId(null)
  }

  // Countdown ring progress (0-100)
  const maxSecs = MAX_POLL_TIME / 1000
  const progress = Math.min((elapsedSecs / maxSecs) * 100, 100)
  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={step === 'form' ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-[#0A0A0F] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/60 animate-modal-in">
        {/* Close button */}
        {(step === 'form' || step === 'done' || step === 'failed') && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-all text-sm"
          >
            ✕
          </button>
        )}

        {/* ── FORM STEP ── */}
        {step === 'form' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-black tracking-tight">Deposit via M-Pesa</h2>
              <p className="text-xs text-gray-500 mt-0.5">Funds arrive instantly after PIN entry</p>
            </div>

            {/* Amount */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block font-semibold">
                Amount (KES)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3 text-white font-black text-xl focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                  min={10}
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                      amount === a
                        ? 'bg-[#D4AF37]/20 border-[#D4AF37]/60 text-[#D4AF37]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block font-semibold">
                M-Pesa Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">📱</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                  placeholder="0712 345 678"
                />
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={loading || amount < 10 || !phone}
              className="w-full py-4 rounded-xl font-black text-base text-black bg-[#D4AF37] hover:bg-[#F0CA50] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Initiating...
                </span>
              ) : (
                `PAY ${amount.toLocaleString()} KES`
              )}
            </button>
          </div>
        )}

        {/* ── WAITING STEP ── */}
        {step === 'waiting' && (
          <div className="text-center py-4 space-y-5">
            {/* Animated ring */}
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="40" cy="40" r="36"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-bounce">📱</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black mb-1">Check Your Phone</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Enter your M-Pesa PIN to confirm{' '}
                <span className="text-[#D4AF37] font-bold">{amount.toLocaleString()} KES</span>
              </p>
            </div>

            {/* Pulsing dots */}
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>

            <div className="text-[11px] text-gray-600">
              Waiting for confirmation · {elapsedSecs}s elapsed
            </div>

            <button
              onClick={handleRetry}
              className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
            >
              Cancel & try again
            </button>
          </div>
        )}

        {/* ── SUCCESS STEP ── */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-green-400 mb-1">Deposit Successful!</h3>
              <p className="text-gray-400 text-sm">
                <span className="text-white font-bold">{amount.toLocaleString()} KES</span> added to your balance
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-black text-base text-black bg-[#D4AF37] hover:bg-[#F0CA50] transition-all active:scale-[0.98]"
            >
              PLAY NOW 🃏
            </button>
          </div>
        )}

        {/* ── FAILED STEP ── */}
        {step === 'failed' && (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <span className="text-3xl">❌</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-red-400 mb-1">Payment Failed</h3>
              <p className="text-gray-400 text-sm">
                The payment was not completed. If money was deducted, contact support.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-[#D4AF37] hover:bg-[#F0CA50] transition-all"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-400 bg-white/5 hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}