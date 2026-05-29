import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WalletClient from './WalletClient'

export default async function WalletPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single()
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return <WalletClient user={user} transactions={transactions || []} />
}