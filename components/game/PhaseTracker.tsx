'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState } from 'react'
import type { Phase } from '@/types/game'

const ACTIVE_PHASES: { key: Phase; label: string; icon: string }[] = [
  { key: 'BETTING', label: 'Betting', icon: '🎯' },
  { key: 'MULTIPLIER', label: 'Rising', icon: '📈' },
  { key: 'LOCK', label: 'Locked', icon: '🔒' },
  { key: 'FLIP', label: 'Flip', icon: '🃏' },
  { key: 'RESOLUTION', label: 'Result', icon: '🏆' },
]

export default function PhaseTracker() {
  const phase = useGameStore((s) => s.phase)
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt)
  const roundNumber = useGameStore((s) => s.roundNumber)

  const [msLeft, setMsLeft] = useState(0)

  useEffect(() => {
    if (!phaseEndsAt || phase === 'WAITING') return
    const tick = () => setMsLeft(Math.max(0, phaseEndsAt - Date.now()))
    tick()
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [phaseEndsAt, phase])

  if (phase === 'WAITING') {
    return (
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-pulse" />
          Waiting for next round
        </span>
        {roundNumber > 0 && (
          <span className="font-mono text-gray-700">#{roundNumber.toString().padStart(6, '0')}</span>
        )}
      </div>
    )
  }

  const activeIdx = ACTIVE_PHASES.findIndex((p) => p.key === phase)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {ACTIVE_PHASES.map((p, i) => (
            <div key={p.key} className="flex items-center gap-1">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
                i === activeIdx
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40'
                  : i < activeIdx
                    ? 'text-gray-600'
                    : 'text-gray-700'
              }`}>
                {i === activeIdx && <span>{p.icon}</span>}
                <span>{p.label}</span>
              </div>
              {i < ACTIVE_PHASES.length - 1 && (
                <span className={`text-[8px] ${i < activeIdx ? 'text-gray-600' : 'text-gray-800'}`}>›</span>
              )}
            </div>
          ))}
        </div>
        {phaseEndsAt && msLeft > 0 && (
          <span className="text-[10px] font-mono text-gray-500">
            {(msLeft / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      {/* Progress bar */}
      <div className="h-px bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#D4AF37]/60 rounded-full transition-all duration-300"
          style={{ width: `${((activeIdx + 1) / ACTIVE_PHASES.length) * 100}%` }}
        />
      </div>
    </div>
  )
}