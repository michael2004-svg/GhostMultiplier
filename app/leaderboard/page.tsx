import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import Leaderboard from '@/components/game/Leaderboard'

export default async function LeaderboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="min-h-screen nairobi-bg">
      <Header user={null} />
      <div className="pt-20 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-nk-gold mb-6">Leaderboard</h1>
        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4" style={{ minHeight: 500 }}>
          <Leaderboard />
        </div>
      </div>
      <MobileNav />
    </div>
  )
}