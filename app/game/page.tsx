import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GameClient from './GameClient'

export default async function GamePage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/login')

  let { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Profile missing — create it now (happens right after registration)
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? 'Player',
        phone: user.user_metadata?.phone ?? null,
      })
      .select('*')
      .single()

    profile = newProfile
  }

  // Still null means DB/RLS issue — show error, don't redirect to /login
  if (!profile) {
    return (
      <div className="min-h-screen nairobi-bg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <div className="text-xl font-bold mb-2">Profile setup failed</div>
          <div className="text-gray-400 text-sm">Check your Supabase RLS policies allow insert on the users table.</div>
        </div>
      </div>
    )
  }

  return <GameClient initialUser={profile} />
}