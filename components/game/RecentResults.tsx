'use client'
import { useGameStore } from '@/store/gameStore'
import type { Color } from '@/types/game'

export default function RecentResults() {
  const recentResults = useGameStore((s) => s.recentResults)
  const roundNumber = useGameStore((s) => s.roundNumber)

  function badge(c: Color, i: number) {
    const cls = c === 'RED' ? 'result-R' : c === 'JOKER' ? 'result-J' : 'result-B'
    const label = c === 'JOKER' ? 'J' : c === 'RED' ? 'R' : 'B'
    return (
      <span key={i} className={`${cls} w-7 h-7 rounded-full flex items-center justify-center text-xs font-black`}>
        {label}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden lg:flex items-center gap-1 text-xs text-gray-500 mr-2">
        <span>Recent Results</span>
      </div>
      <div className="flex gap-1.5">
        {recentResults.length === 0
          ? [...Array(10)].map((_, i) => (
              <span key={i} className="w-7 h-7 rounded-full bg-[#1A0000] border border-[#333]" />
            ))
          : recentResults.map((c, i) => badge(c, i))}
      </div>
      {roundNumber > 0 && (
        <div className="ml-2 text-right hidden lg:block">
          <div className="text-[10px] text-gray-600">ROUND ID</div>
          <div className="text-xs font-mono text-gray-400">#{roundNumber.toString().padStart(6, '0')}</div>
        </div>
      )}
    </div>
  )
}