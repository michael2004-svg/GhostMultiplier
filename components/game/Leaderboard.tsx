'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const TAB_LABELS = ['DAILY', 'WEEKLY', 'ALL TIME'] as const
type Tab = typeof TAB_LABELS[number]

interface LeaderboardEntry {
  rank: number
  username: string
  avatarUrl?: string
  vipLevel: string
  totalProfit: number
}

const VIP_COLORS: Record<string, string> = {
  Bronze: 'text-amber-600',
  Silver: 'text-gray-400',
  Gold: 'text-yellow-400',
  Platinum: 'text-cyan-400',
  Diamond: 'text-purple-400',
}

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>('DAILY')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    setLoading(true)

    supabase
      .from('bets')
      .select(`
        profit,
        user_id,
        users (
          username,
          avatar_url,
          vip_level
        )
      `)
      .not('profit', 'is', null)
      .order('profit', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (!data) { setLoading(false); return }

        // Aggregate profit per user
        const map = new Map<string, LeaderboardEntry>()
        data.forEach((bet: any) => {
          const u = bet.users
          if (!u) return
          const existing = map.get(bet.user_id)
          if (existing) {
            existing.totalProfit += bet.profit ?? 0
          } else {
            map.set(bet.user_id, {
              rank: 0,
              username: u.username ?? 'Player',
              avatarUrl: u.avatar_url,
              vipLevel: u.vip_level ?? 'Bronze',
              totalProfit: bet.profit ?? 0,
            })
          }
        })

        const sorted = Array.from(map.values())
          .sort((a, b) => b.totalProfit - a.totalProfit)
          .map((e, i) => ({ ...e, rank: i + 1 }))

        setEntries(sorted)
        setLoading(false)
      })
  }, [tab])

  function rankIcon(r: number) {
    if (r === 1) return <span className="text-yellow-400 text-lg">👑</span>
    if (r === 2) return <span className="text-gray-400 text-base">🥈</span>
    if (r === 3) return <span className="text-amber-600 text-base">🥉</span>
    return <span className="text-gray-600 text-sm font-bold w-4 text-center">{r}</span>
  }

  function formatProfit(p: number) {
    if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(2)}M`
    if (p >= 1_000) return `${(p / 1_000).toFixed(1)}K`
    return p.toLocaleString()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TAB_LABELS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              tab === t ? 'bg-nk-red text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-1 overflow-y-auto flex-1">
        {loading ? (
          <div className="text-center text-gray-600 text-xs py-8">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-8">No data yet</div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.username}
              className="flex items-center gap-2 py-2 border-b border-[#ffffff08]"
            >
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {rankIcon(entry.rank)}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nk-gold to-nk-red flex-shrink-0 flex items-center justify-center text-xs font-black">
                {entry.avatarUrl ? (
                  <img
                    src={entry.avatarUrl}
                    alt={entry.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  entry.username[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{entry.username}</div>
                <div className={`text-[9px] font-bold ${VIP_COLORS[entry.vipLevel] ?? 'text-amber-600'}`}>
                  {entry.vipLevel?.toUpperCase()}
                </div>
              </div>
              <div className="text-sm font-black text-nk-gold flex-shrink-0">
                {formatProfit(entry.totalProfit)} KES
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

