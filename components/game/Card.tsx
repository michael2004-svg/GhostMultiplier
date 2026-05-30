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
      const t1 = setTimeout(() => setFlipped(true), 300)
      const t2 = setTimeout(() => setShowFace(true), 800)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    if (phase === 'BETTING' || phase === 'IDLE') {
      setFlipped(false)
      setShowFace(false)
    }
  }, [phase])

  return (
    <div style={{ perspective: '600px', width: 160, height: 220 }}>
      <div
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-nk-gold bg-gradient-to-br from-[#8B0000] via-[#C0392B] to-[#8B0000] flex flex-col items-center justify-center gap-2 shadow-2xl card-glow-gold"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-5xl">👑</span>
          <div className="w-12 h-0.5 bg-nk-gold opacity-50" />
          <div className="w-8 h-0.5 bg-nk-gold opacity-30" />
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {!showFace ? (
            <div className="w-full h-full rounded-2xl bg-[#111] border-2 border-gray-700 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-nk-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : jokerActive || outcomeColor === 'JOKER' ? (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-900 via-green-900 to-purple-900 border-2 border-purple-500 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl">🃏</span>
              <span className="text-nk-gold font-black text-sm tracking-widest">JOKER</span>
            </div>
          ) : outcomeColor === 'RED' ? (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#C0392B] border-2 border-[#E74C3C] flex flex-col items-center justify-center card-glow-red">
              <span className="text-5xl">♦️</span>
              <span className="font-black text-white text-xl tracking-widest mt-2">RED</span>
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#111] to-[#222] border-2 border-gray-600 flex flex-col items-center justify-center card-glow-black">
              <span className="text-5xl">♠️</span>
              <span className="font-black text-white text-xl tracking-widest mt-2">BLACK</span>
            </div>
          )}
        </div>
      </div>

      {/* Glow beneath card */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-nk-red opacity-20 rounded-full blur-xl" />
    </div>
  )
}