import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      rounds(round_number, outcome_color, crash_multiplier, client_seed, server_seed)
    `)
    .eq('user_id', user.id)
    .order('placed_at', { ascending: false })
    .limit(20)

  return <HistoryClient bets={bets || []} />
}