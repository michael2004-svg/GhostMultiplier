'use client'
import { useEffect, useState } from 'react'
import { formatKES } from '@/lib/gameEngine'
import type { LeaderboardEntry, VIPLevel } from '@/types/game'

const TAB_LABELS = ['DAILY', 'WEEKLY', 'ALL TIME'] as const
type Tab = typeof TAB_LABELS[number]

function VIPBadge({ level }: { level: VIPLevel }) {
  const colors: Record<VIPLevel, string> = {
    Bronze: 'text-amber-600',
    Silver: 'text-gray-400',
    Gold: 'text-yellow-400',
    Platinum: 'text-cyan-400',
    Diamond: 'text-purple-400',
  }
  return <span className={`text-[9px] font-bold ${colors[level]}`}>{level.toUpperCase()}</span>
}

export default function Leaderboard() {
  const [tab, setTab] = useState<Tab>('DAILY')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Mock data for now — replace with actual Supabase query
    setEntries([
      { rank: 1, username: 'NairobiKing', vipLevel: 'Gold', totalProfit: 2450000, totalBets: 892, avatarUrl: '' },
      { rank: 2, username: 'HighRoller', vipLevel: 'Silver', totalProfit: 1870000, totalBets: 654, avatarUrl: '' },
      { rank: 3, username: 'QueenBee', vipLevel: 'Bronze', totalProfit: 1250000, totalBets: 412, avatarUrl: '' },
      { rank: 4, username: 'Mfalme', vipLevel: 'Bronze', totalProfit: 945000, totalBets: 387, avatarUrl: '' },
      { rank: 5, username: 'GameLord', vipLevel: 'Bronze', totalProfit: 832000, totalBets: 311, avatarUrl: '' },
    ])
  }, [tab])

  const rankIcon = (r: number) => {
    if (r === 1) return <span className="rank-1 text-lg">👑</span>
    if (r === 2) return <span className="rank-2 text-base">🥈</span>
    if (r === 3) return <span className="rank-3 text-base">🥉</span>
    return <span className="text-gray-600 text-sm font-bold">{r}</span>
  }

  return (
    <div className="flex flex-col h-full">
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

      <div className="space-y-2 overflow-y-auto flex-1">
        {entries.map((entry) => (
          <div key={entry.username} className="flex items-center gap-2 py-2 border-b border-[#ffffff08]">
            <div className="w-6 text-center flex-shrink-0">{rankIcon(entry.rank)}</div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nk-gold to-nk-red flex-shrink-0 flex items-center justify-center text-xs font-bold">
              {entry.username[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{entry.username}</div>
              <VIPBadge level={entry.vipLevel} />
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black text-nk-gold">{formatKES(entry.totalProfit)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

