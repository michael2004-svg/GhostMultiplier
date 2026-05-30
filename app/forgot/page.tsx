'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Reset link sent!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen nairobi-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">👑</span>
          <div className="text-2xl font-black text-nk-gold mt-2">NAIROBI KING</div>
        </div>
        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-gray-400">Check your email for a reset link.</p>
              <Link href="/login" className="text-nk-gold mt-4 inline-block hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4 mt-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1A0000] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nk-gold"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-place-bet text-white font-bold py-4 rounded-xl text-lg"
              >
                {loading ? 'Sending...' : 'SEND RESET LINK'}
              </button>
              <Link href="/login" className="block text-center text-gray-500 text-sm hover:text-nk-gold">
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

