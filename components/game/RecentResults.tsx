'use client'
import { useGameStore } from '@/store/gameStore'
import type { Color } from '@/types/game'

function ResultBadge({ color, index }: { color: Color; index: number }) {
  const isNew = index === 0
  return (
    <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
      color === 'RED'
        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
        : color === 'JOKER'
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
          : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
    } ${isNew ? 'scale-110 ring-1 ring-offset-1 ring-offset-transparent ring-[#D4AF37]/40' : ''}`}>
      {color === 'JOKER' ? 'J' : color === 'RED' ? 'R' : 'B'}
    </div>
  )
}

export default function RecentResults() {
  const recentResults = useGameStore((s) => s.recentResults)
  const roundNumber = useGameStore((s) => s.roundNumber)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold hidden sm:block">
        Last 10
      </span>
      <div className="flex gap-1.5">
        {recentResults.length === 0
          ? [...Array(10)].map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full bg-white/5 border border-white/10 animate-pulse" />
            ))
          : recentResults.map((c, i) => <ResultBadge key={i} color={c} index={i} />)
        }
      </div>
      {roundNumber > 0 && (
        <span className="text-[10px] font-mono text-gray-700 hidden lg:block ml-1">
          #{roundNumber.toString().padStart(6, '0')}
        </span>
      )}
    </div>
  )
}