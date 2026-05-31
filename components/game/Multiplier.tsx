'use client'
import { useGameStore } from '@/store/gameStore'
import { getMultiplierColor } from '@/lib/multiplierUtils'
import { formatMultiplier } from '@/lib/gameEngine'
import { useEffect, useRef, useState } from 'react'

export default function Multiplier() {
  const multiplier = useGameStore((s) => s.multiplier)
  const phase = useGameStore((s) => s.phase)
  const nextRoundAt = useGameStore((s) => s.nextRoundAt)
  const outcomeColor = useGameStore((s) => s.outcomeColor)

  const ref = useRef<HTMLDivElement>(null)
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for WAITING phase
  useEffect(() => {
    if (phase !== 'WAITING' || !nextRoundAt) return
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((nextRoundAt - Date.now()) / 1000))
      setCountdown(remaining)
    }
    tick()
    const id = setInterval(tick, 200)
    return () => clearInterval(id)
  }, [phase, nextRoundAt])

  useEffect(() => {
    if (ref.current && phase === 'MULTIPLIER') {
      ref.current.classList.remove('animate-multiplier-tick')
      void ref.current.offsetWidth
      ref.current.classList.add('animate-multiplier-tick')
    }
  }, [multiplier, phase])

  const colorClass = getMultiplierColor(multiplier)
  const isActive = phase === 'MULTIPLIER' || phase === 'LOCK'

  // ── WAITING STAGE ──────────────────────────────────────────
  if (phase === 'WAITING') {
    return (
      <div className="text-center select-none flex flex-col items-center gap-3">
        {/* Pulsing orb */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#D4AF37]/10 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-[#D4AF37]/10 animate-ping" style={{ animationDelay: '0.3s' }} />
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center">
            <span className="text-2xl font-black text-[#D4AF37]">{countdown > 0 ? countdown : '•'}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-semibold">
            Next Round In
          </div>
          <div className="text-4xl font-black text-[#D4AF37] tabular-nums">
            {countdown > 0 ? `${countdown}s` : 'Starting...'}
          </div>
        </div>
        {/* Animated bar */}
        <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#D4AF37] rounded-full transition-all duration-200"
            style={{
              width: nextRoundAt
                ? `${Math.max(0, 100 - (countdown / (Math.ceil((nextRoundAt - (nextRoundAt - 8000)) / 1000))) * 100)}%`
                : '0%'
            }}
          />
        </div>
      </div>
    )
  }

  // ── ACTIVE ROUND STAGES ─────────────────────────────────────
  return (
    <div className="text-center select-none">
      <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-semibold">
        {phase === 'BETTING' && 'Place Your Bet'}
        {phase === 'MULTIPLIER' && 'Multiplier Rising'}
        {phase === 'LOCK' && 'Locked In'}
        {phase === 'FLIP' && 'Flipping Card...'}
        {phase === 'RESOLUTION' && outcomeColor && (
          <span className={outcomeColor === 'RED' ? 'text-red-400' : outcomeColor === 'JOKER' ? 'text-purple-400' : 'text-gray-300'}>
            {outcomeColor === 'JOKER' ? '🃏 JOKER!' : `${outcomeColor} Wins`}
          </span>
        )}
        {phase === 'RESOLUTION' && !outcomeColor && 'Round Over'}
      </div>

      <div
        ref={ref}
        className={`font-black leading-none transition-all duration-100 ${colorClass} ${
          isActive ? 'text-8xl drop-shadow-[0_0_40px_currentColor]' : 'text-6xl opacity-60'
        }`}
      >
        {formatMultiplier(multiplier)}
      </div>

      {phase === 'MULTIPLIER' && (
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-nk-red rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {phase === 'BETTING' && (
        <div className="mt-3 flex justify-center">
          <div className="px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold animate-pulse">
            BETS OPEN
          </div>
        </div>
      )}

      {phase === 'FLIP' && (
        <div className="mt-4 flex justify-center">
          <div className="w-12 h-16 relative" style={{ perspective: '400px' }}>
            <div
              className="w-full h-full rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#b8870f] border border-[#D4AF37]/60 flex items-center justify-center text-2xl font-black text-black shadow-lg shadow-[#D4AF37]/20"
              style={{ animation: 'card-flip 0.6s ease-in-out infinite alternate' }}
            >
              🃏
            </div>
          </div>
        </div>
      )}
    </div>
  )
}