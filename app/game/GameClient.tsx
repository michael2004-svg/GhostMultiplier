'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import MobileNav from '@/components/layout/MobileNav'
import PhaseTracker from '@/components/game/PhaseTracker'
import RecentResults from '@/components/game/RecentResults'
import Card from '@/components/game/Card'
import MultiplierGraph from '@/components/game/MultiplierGraph'
import LiveFeed from '@/components/game/LiveFeed'
import BetPanel from '@/components/game/BetPanel'
import PowerUpTokens from '@/components/game/PowerUpTokens'
import Leaderboard from '@/components/game/Leaderboard'
import JokerOverlay from '@/components/game/JokerOverlay'
import VIPBar from '@/components/game/VIPBar'
import { useGameStore } from '@/store/gameStore'
import { useBalance } from '@/lib/hooks/useBalance'
import { useGame } from '@/lib/hooks/useGame'
import { formatMultiplier } from '@/lib/gameEngine'
import { getMultiplierColor } from '@/lib/multiplierUtils'
import type { User } from '@/types/user'

interface GameClientProps {
  initialUser: User
}

export default function GameClient({ initialUser }: GameClientProps) {
  const phase = useGameStore((s) => s.phase)
  const multiplier = useGameStore((s) => s.multiplier)
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt)
  const { balance } = useBalance(initialUser.id)
  const [soundOn, setSoundOn] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // Connect to Supabase Realtime broadcasts
  useGame(initialUser.id)

  // Live countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (phaseEndsAt) {
        setSecondsLeft(Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000)))
      } else {
        setSecondsLeft(0)
      }
    }, 250)
    return () => clearInterval(interval)
  }, [phaseEndsAt])

  const multColorClass = getMultiplierColor(multiplier)
  const multLabel = formatMultiplier(multiplier)

  // Merge live balance into user object for header
  const userWithBalance: User = { ...initialUser, balance }

  return (
    <div className="min-h-screen nairobi-bg flex flex-col">
      <Header user={userWithBalance} />
      <JokerOverlay />

      {/* Ember particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="ember animate-ember absolute"
            style={{
              left: `${10 + i * 12}%`,
              bottom: `${10 + (i % 3) * 15}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      <div className="flex-1 pt-16 pb-16 lg:pb-8 relative z-10">

        {/* ── DESKTOP ── */}
        <div className="hidden lg:flex h-[calc(100vh-64px)]">

          {/* LEFT: Live feed */}
          <div className="w-[240px] flex-shrink-0 border-r border-[#D4AF3722] overflow-y-auto p-4">
            <LiveFeed />
          </div>

          {/* CENTER */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-[#D4AF3722] px-6 py-3">
              <RecentResults />
            </div>
            <div className="px-6 py-3 border-b border-[#D4AF3722]">
              <PhaseTracker />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 overflow-auto">
              <div className="w-full max-w-[560px]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Multiplier</div>
                <div className={`text-7xl font-black leading-none ${multColorClass}`}>
                  {multLabel}
                </div>
              </div>
              <div className="relative w-full max-w-[560px] h-[220px]">
                <div className="absolute inset-0">
                  <MultiplierGraph />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Card />
                </div>
              </div>
              <div className="w-full max-w-[560px]">
                <BetPanel userId={initialUser.id} balance={balance} />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-[280px] flex-shrink-0 border-l border-[#D4AF3722] flex flex-col">
            <div className="p-4 border-b border-[#D4AF3722]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Power-Up Tokens
                </span>
              </div>
              <PowerUpTokens userId={initialUser.id} />
            </div>
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Leaderboard
              </span>
              <Leaderboard />
            </div>
            <div className="p-4 border-t border-[#D4AF3722] text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Next Round Starts In
              </div>
              <div className="text-3xl font-black text-nk-red">
                {phase === 'RESOLUTION' || phase === 'WAITING' ? `${secondsLeft}s` : 'LIVE'}
              </div>
              <div className="flex gap-1 mt-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i < secondsLeft ? 'bg-nk-red' : 'bg-[#1A0000]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE ── */}
        <div className="lg:hidden flex flex-col px-4 py-4 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 mb-1">Last 10 Rounds</div>
              <RecentResults />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">JOKER</div>
              <div className="text-2xl">🃏</div>
              <div className="text-xs text-gray-500">1/20</div>
            </div>
          </div>

          <PhaseTracker />

          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
            <div className={`text-center text-6xl font-black mb-2 ${multColorClass}`}>
              {multLabel}
            </div>
            <div className="h-32">
              <MultiplierGraph />
            </div>
            <div className="flex justify-center mt-4">
              <Card />
            </div>
          </div>

          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-3 max-h-36 overflow-y-auto">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Live Feed</div>
            <LiveFeed />
          </div>

          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
            <BetPanel userId={initialUser.id} balance={balance} />
          </div>

          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Power-Up Tokens
            </div>
            <PowerUpTokens userId={initialUser.id} />
          </div>

          <div className="text-center py-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Next Round In</div>
            <div className="text-3xl font-black text-nk-red mt-1">
              {phase === 'RESOLUTION' || phase === 'WAITING' ? `${secondsLeft}s` : 'LIVE'}
            </div>
          </div>
        </div>
      </div>

      <VIPBar user={initialUser} />
      <MobileNav />

      <button
        onClick={() => setSoundOn((v) => !v)}
        className="fixed bottom-20 left-4 lg:bottom-6 lg:left-4 text-xs text-gray-500 hover:text-white flex items-center gap-2 z-50 transition-colors"
      >
        <span>{soundOn ? '🔊' : '🔇'}</span>
        <span>{soundOn ? 'SOUND ON' : 'SOUND OFF'}</span>
      </button>
    </div>
  )
}
