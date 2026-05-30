import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ count: totalPlayers }, { data: recentRounds }, { data: pendingWithdrawals }] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('rounds').select('*').order('started_at', { ascending: false }).limit(10),
      supabase.from('transactions').select('*').eq('type', 'WITHDRAW').eq('status', 'PENDING'),
    ])

  return (
    <div className="min-h-screen nairobi-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">👑</span>
          <h1 className="text-3xl font-black text-nk-gold">Admin Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Players', value: totalPlayers ?? 0, icon: '👥' },
            { label: 'Pending Withdrawals', value: pendingWithdrawals?.length ?? 0, icon: '💳' },
            { label: 'Rounds Today', value: recentRounds?.length ?? 0, icon: '🎴' },
            { label: 'House Edge', value: '5%', icon: '📊' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-black mb-4">Recent Rounds</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4AF3722] text-gray-500 text-xs uppercase">
                  <th className="text-left py-2 pr-4">Round #</th>
                  <th className="text-left py-2 pr-4">Phase</th>
                  <th className="text-left py-2 pr-4">Outcome</th>
                  <th className="text-right py-2">Multiplier</th>
                </tr>
              </thead>
              <tbody>
                {recentRounds?.map((r) => (
                  <tr key={r.id} className="border-b border-[#ffffff08] py-2">
                    <td className="py-3 pr-4 font-mono text-gray-400">
                      #{r.round_number?.toString().padStart(6, '0')}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs bg-[#1A0000] px-2 py-0.5 rounded-full text-gray-400">
                        {r.phase}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {r.outcome_color ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          r.outcome_color === 'RED' ? 'bg-red-900 text-red-300' :
                          r.outcome_color === 'JOKER' ? 'bg-purple-900 text-purple-300' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {r.outcome_color}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 text-right font-mono text-nk-orange">
                      {r.crash_multiplier ? `${r.crash_multiplier}x` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-6">
          <h2 className="text-lg font-black mb-4">
            Pending Withdrawals
            {pendingWithdrawals && pendingWithdrawals.length > 0 && (
              <span className="ml-2 text-sm bg-nk-red text-white px-2 py-0.5 rounded-full">
                {pendingWithdrawals.length}
              </span>
            )}
          </h2>
          {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
            <div className="space-y-3">
              {pendingWithdrawals.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border-b border-[#ffffff08] py-3">
                  <div>
                    <div className="font-bold">{tx.user_id}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-black text-nk-gold">{tx.amount?.toLocaleString()} KES</div>
                    <button className="btn-place-bet text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                      Approve
                    </button>
                    <button className="bg-nk-red text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">No pending withdrawals</div>
          )}
        </div>
      </div>
    </div>
  )
}
