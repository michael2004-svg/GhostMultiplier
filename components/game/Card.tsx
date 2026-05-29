'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect, useState } from 'react'

export default function Card() {
  const phase = useGameStore((s) => s.phase)
  const outcomeColor = useGameStore((s) => s.outcomeColor)
  const jokerActive = useGameStore((s) => s.jokerActive)
  const [flipped, setFlipped] = useState(false)
  const [showFace, setShowFace] = useState(false)

  useEffect(() => {
    if (phase === 'FLIP') {
      setTimeout(() => { setFlipped(true) }, 500)
      setTimeout(() => { setShowFace(true) }, 1000)
    } else if (phase === 'BETTING') {
      setFlipped(false)
      setShowFace(false)
    }
  }, [phase])

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative animate-card-float transition-all duration-700`}
        style={{ perspective: '600px', width: 200, height: 280 }}
      >
        <div
          className="w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Back */}
          <div
            className="absolute inset-0 rounded-2xl card-glow-gold flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full rounded-2xl border-2 border-nk-gold bg-gradient-to-br from-[#8B0000] via-[#C0392B] to-[#8B0000] flex flex-col items-center justify-center gap-2 shadow-2xl">
              <span className="text-6xl filter drop-shadow-lg">👑</span>
              <div className="w-16 h-0.5 bg-nk-gold opacity-50" />
              <div className="w-8 h-0.5 bg-nk-gold opacity-30" />
            </div>
          </div>

          {/* Card Front (revealed) */}
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {jokerActive ? (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-900 via-green-900 to-purple-900 border-2 border-purple-500 flex flex-col items-center justify-center gap-2">
                <span className="text-6xl">🃏</span>
                <span className="text-nk-gold font-black text-sm tracking-widest">JOKER</span>
              </div>
            ) : outcomeColor === 'RED' ? (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#C0392B] border-2 border-[#E74C3C] flex flex-col items-center justify-center card-glow-red">
                <span className="text-6xl">♦️</span>
                <span className="font-black text-white text-xl tracking-widest">RED</span>
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#111] to-[#222] border-2 border-gray-600 flex flex-col items-center justify-center card-glow-black">
                <span className="text-6xl">♠️</span>
                <span className="font-black text-white text-xl tracking-widest">BLACK</span>
              </div>
            )}
          </div>
        </div>

        {/* Pedestal glow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-6 bg-nk-red opacity-20 rounded-full blur-xl" />
      </div>
    </div>
  )
}