'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/game')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen nairobi-bg flex items-center justify-center p-4">
      {/* Ember particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="ember animate-ember absolute"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `${Math.random() * 40}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">👑</span>
            <div>
              <div className="text-2xl font-black text-nk-gold tracking-wider">NAIROBI KING</div>
              <div className="text-xs text-gray-500 tracking-widest">FLIP GAME</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A0000] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nk-gold transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1A0000] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nk-gold transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-place-bet text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 mt-2"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot" className="text-sm text-gray-500 hover:text-nk-gold transition-colors">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[#D4AF3722] text-center">
            <span className="text-gray-500 text-sm">No account? </span>
            <Link href="/register" className="text-nk-gold font-semibold hover:underline text-sm">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}