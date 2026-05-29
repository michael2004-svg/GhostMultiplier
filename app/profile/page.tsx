import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { getVIPProgress } from '@/lib/gameEngine'

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single()
  if (!user) redirect('/login')

  const progress = getVIPProgress(user.xp, user.vip_level)

  return (
    <div className="min-h-screen nairobi-bg">
      <Header user={user} />
      <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-nk-gold mb-6">Profile</h1>

        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nk-gold to-nk-red flex items-center justify-center text-2xl font-black">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-black">{user.username}</div>
              <div className="text-gray-500 text-sm">{user.email}</div>
              <div className="text-nk-gold text-sm font-bold">VIP {user.vip_level}</div>
            </div>
          </div>

          {/* XP progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{user.vip_level}</span>
              <span>{user.xp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-[#1A0000] rounded-full">
              <div className="vip-bar h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Bets', value: user.total_wagered, unit: 'KES' },
            { label: 'Total Won', value: user.total_won, unit: 'KES' },
            { label: 'XP Points', value: user.xp, unit: 'XP' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0D0000] border border-[#D4AF3722] rounded-xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="font-black text-white">{stat.value?.toLocaleString()}</div>
              <div className="text-xs text-gray-600">{stat.unit}</div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}