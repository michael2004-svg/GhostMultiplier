'use client'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'

export default function HistoryClient({ bets }: { bets: any[] }) {
  return (
    <div className="min-h-screen nairobi-bg">
      <Header user={null} />
      <div className="pt-20 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-nk-gold mb-6">Bet History</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D4AF3722] text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left py-3 pr-4">Round #</th>
                <th className="text-left py-3 pr-4">Pick</th>
                <th className="text-left py-3 pr-4">Outcome</th>
                <th className="text-right py-3 pr-4">Bet</th>
                <th className="text-right py-3 pr-4">Result</th>
                <th className="text-right py-3">Profit</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} className="border-b border-[#ffffff08] hover:bg-[#1A000022] transition-colors">
                  <td className="py-3 pr-4 font-mono text-gray-400">
                    #{bet.rounds?.round_number?.toString().padStart(6, '0')}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      bet.color_choice === 'RED' ? 'bg-red-900 text-red-300' : 'bg-gray-800 text-gray-300'
                    }`}>
                      {bet.color_choice}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      bet.rounds?.outcome_color === 'RED' ? 'bg-red-900 text-red-300' :
                      bet.rounds?.outcome_color === 'JOKER' ? 'bg-purple-900 text-purple-300' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {bet.rounds?.outcome_color}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-bold">
                    {bet.amount.toLocaleString()} KES
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                      bet.outcome === 'WIN' || bet.outcome === 'CASHOUT' ? 'bg-green-900 text-green-300' :
                      bet.outcome === 'LOSS' ? 'bg-red-900 text-red-300' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {bet.outcome}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold">
                    <span className={bet.profit > 0 ? 'text-nk-green' : bet.profit < 0 ? 'text-nk-red' : 'text-gray-500'}>
                      {bet.profit > 0 ? '+' : ''}{(bet.profit || 0).toLocaleString()} KES
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bets.length === 0 && (
            <div className="text-center py-16 text-gray-500">No bets yet. Start playing!</div>
          )}
        </div>
      </div>
      <MobileNav />
    </div>
  )
}