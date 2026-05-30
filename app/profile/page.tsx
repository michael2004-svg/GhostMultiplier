import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import { getVIPProgress } from '@/lib/gameEngine'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const progress = getVIPProgress(profile.xp, profile.vip_level)

  return (
    <div className="min-h-screen nairobi-bg">
      <Header user={profile} />
      <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-nk-gold mb-6">Profile</h1>

        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nk-gold to-nk-red flex items-center justify-center text-2xl font-black">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xl font-black">{profile.username}</div>
              <div className="text-gray-500 text-sm">{profile.email}</div>
              <div className="text-nk-gold text-sm font-bold">VIP {profile.vip_level}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{profile.vip_level}</span>
              <span>{profile.xp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-[#1A0000] rounded-full">
              <div className="vip-bar h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Bets', value: profile.total_wagered, unit: 'KES' },
            { label: 'Total Won', value: profile.total_won, unit: 'KES' },
            { label: 'XP Points', value: profile.xp, unit: 'XP' },
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