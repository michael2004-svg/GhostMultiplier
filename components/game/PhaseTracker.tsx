'use client'
import { useGameStore } from '@/store/gameStore'
import type { Phase } from '@/types/game'

const PHASES: { key: Phase; label: string; time: string }[] = [
  { key: 'BETTING', label: 'BETTING', time: '0s – 2s' },
  { key: 'MULTIPLIER', label: 'MULTIPLIER', time: '2s – 7s' },
  { key: 'LOCK', label: 'LOCK', time: '7s – 8s' },
  { key: 'FLIP', label: 'FLIP', time: '8s – 10s' },
  { key: 'RESOLUTION', label: 'RESOLUTION', time: '10s – 13s' },
]

export default function PhaseTracker() {
  const phase = useGameStore((s) => s.phase)
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt)

  const activeIdx = PHASES.findIndex((p) => p.key === phase)
  const progress = activeIdx / (PHASES.length - 1)

  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-2">
        {PHASES.map((p, i) => (
          <div key={p.key} className={`flex flex-col items-center text-center flex-1 ${i === activeIdx ? 'phase-active' : 'phase-inactive'}`}>
            <span className={`text-[10px] sm:text-xs font-bold tracking-wider pb-1 ${i === activeIdx ? 'text-nk-gold border-b-2 border-nk-gold' : 'text-gray-600'}`}>
              {p.label}
            </span>
            <span className={`text-[9px] mt-1 hidden sm:block ${i === activeIdx ? 'text-nk-gold' : 'text-gray-700'}`}>
              {p.time}
            </span>
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <div className="h-0.5 bg-[#1A0000] rounded-full mt-1">
        <div
          className="h-full bg-nk-gold rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}