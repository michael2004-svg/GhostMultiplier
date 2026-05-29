'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        username: form.username,
        email: form.email,
        phone: form.phone,
      })
      toast.success('Account created! Welcome to Nairobi King')
      router.push('/game')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen nairobi-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
            <span className="text-4xl">👑</span>
            <div>
              <div className="text-2xl font-black text-nk-gold tracking-wider">NAIROBI KING</div>
              <div className="text-xs text-gray-500 tracking-widest">FLIP GAME</div>
            </div>
          </div>
        </div>

        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { key: 'username', label: 'Username', type: 'text', placeholder: 'NairobiKing' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'phone', label: 'M-Pesa Phone', type: 'tel', placeholder: '0712345678' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof typeof form]}
                  onChange={set(field.key)}
                  className="w-full bg-[#1A0000] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-nk-gold transition-colors"
                  placeholder={field.placeholder}
                  required={field.key !== 'phone'}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-place-bet text-white font-bold py-4 rounded-xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating...' : 'CREATE ACCOUNT'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-[#D4AF3722] text-center">
            <span className="text-gray-500 text-sm">Already have an account? </span>
            <Link href="/login" className="text-nk-gold font-semibold hover:underline text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}