'use client'
import { useGameStore } from '@/store/gameStore'
import { getMultiplierColor } from '@/lib/rng'
import { formatMultiplier } from '@/lib/gameEngine'
import { useEffect, useRef } from 'react'

export default function Multiplier() {
  const multiplier = useGameStore((s) => s.multiplier)
  const phase = useGameStore((s) => s.phase)
  const ref = useRef<HTMLDivElement>(null)

  // Tick animation
  useEffect(() => {
    if (ref.current && phase === 'MULTIPLIER') {
      ref.current.classList.remove('animate-multiplier-tick')
      void ref.current.offsetWidth // reflow
      ref.current.classList.add('animate-multiplier-tick')
    }
  }, [multiplier, phase])

  const colorClass = getMultiplierColor(multiplier)
  const isActive = phase === 'MULTIPLIER' || phase === 'LOCK'

  return (
    <div className="text-center select-none">
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
        {phase === 'BETTING' && 'PLACE YOUR BET'}
        {phase === 'MULTIPLIER' && 'MULTIPLIER RISING'}
        {phase === 'LOCK' && 'LOCKED IN'}
        {phase === 'FLIP' && 'FLIPPING...'}
        {phase === 'RESOLUTION' && 'ROUND OVER'}
        {phase === 'IDLE' && 'NEXT ROUND SOON'}
      </div>
      <div
        ref={ref}
        className={`font-black leading-none transition-colors duration-100 ${colorClass} ${
          isActive ? 'text-8xl' : 'text-6xl opacity-60'
        }`}
      >
        {formatMultiplier(multiplier)}
      </div>
      {phase === 'MULTIPLIER' && (
        <div className="mt-2 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-nk-red rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}