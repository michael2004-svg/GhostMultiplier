import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HistoryClient from './HistoryClient'

export default async function HistoryPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: bets } = await supabase
    .from('bets')
    .select(`
      *,
      rounds(round_number, outcome_color, crash_multiplier, client_seed, server_seed)
    `)
    .eq('user_id', session.user.id)
    .order('placed_at', { ascending: false })
    .limit(20)

  return <HistoryClient bets={bets || []} />
}