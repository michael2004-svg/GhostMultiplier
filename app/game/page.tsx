import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GameClient from './GameClient'

export default async function GamePage() {
  const supabase = createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (!user || error) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return <GameClient initialUser={profile} />
}

