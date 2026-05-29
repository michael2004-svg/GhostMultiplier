'use client'
import { useGameStore } from '@/store/gameStore'
import { useEffect } from 'react'

export default function JokerOverlay() {
  const jokerActive = useGameStore((s) => s.jokerActive)

  if (!jokerActive) return null

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Glitch overlay */}
      <div className="absolute inset-0 joker-overlay bg-black bg-opacity-60" />
      {/* Joker banner */}
      <div className="absolute bottom-0 left-0 right-0 animate-joker-slide">
        <div className="bg-gradient-to-r from-purple-900 via-red-900 to-purple-900 border-t-2 border-red-500 py-4 px-6 flex items-center justify-center gap-4">
          <span className="text-4xl animate-bounce">🃏</span>
          <div className="text-center">
            <div className="text-2xl font-black text-white uppercase tracking-widest">
              JOKER CRASHED THE GAME!
            </div>
            <div className="text-gray-300 text-sm mt-1">No one wins this round.</div>
          </div>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🃏</span>
        </div>
      </div>
    </div>
  )
}