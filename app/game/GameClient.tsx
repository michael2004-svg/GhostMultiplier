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
import { getSocket } from '@/lib/socket'
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

  useEffect(() => {
    // Only connect socket if URL is configured
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) return

    let socket: ReturnType<typeof getSocket>
    try {
      socket = getSocket()
      socket.emit('join:game', { userId: initialUser.id })
    } catch (e) {
      console.warn('Socket unavailable:', e)
    }

    return () => {
      try {
        const s = getSocket()
        s.emit('leave:game', { userId: initialUser.id })
      } catch {}
    }
  }, [initialUser.id])

  const secondsLeft = phaseEndsAt
    ? Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000))
    : 0

  const multColorClass = getMultiplierColor(multiplier)
  const multLabel = formatMultiplier(multiplier)

  return (
    <div className="min-h-screen nairobi-bg flex flex-col">
      <Header user={{ ...initialUser, balance }} />
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

        {/* ── DESKTOP LAYOUT (lg+) ── */}
        <div className="hidden lg:flex h-[calc(100vh-64px)]">

          {/* LEFT: Live feed */}
          <div className="w-[240px] flex-shrink-0 border-r border-[#D4AF3722] overflow-y-auto p-4">
            <LiveFeed />
          </div>

          {/* CENTER */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Recent results bar */}
            <div className="border-b border-[#D4AF3722] px-6 py-3">
              <RecentResults />
            </div>

            {/* Phase tracker */}
            <div className="px-6 py-3 border-b border-[#D4AF3722]">
              <PhaseTracker />
            </div>

            {/* Game content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6 overflow-auto">

              {/* Multiplier display */}
              <div className="w-full max-w-[560px]">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Multiplier
                </div>
                <div className={`text-7xl font-black leading-none ${multColorClass}`}>
                  {multLabel}
                </div>
              </div>

              {/* Graph + Card */}
              <div className="relative w-full max-w-[560px] h-[220px]">
                <div className="absolute inset-0">
                  <MultiplierGraph />
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Card />
                </div>
              </div>

              {/* Bet panel */}
              <div className="w-full max-w-[560px]">
                <BetPanel userId={initialUser.id} balance={balance} />
              </div>

            </div>
          </div>

          {/* RIGHT: Tokens + Leaderboard + Countdown */}
          <div className="w-[280px] flex-shrink-0 border-l border-[#D4AF3722] flex flex-col">

            {/* Power-up tokens */}
            <div className="p-4 border-b border-[#D4AF3722]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Power-Up Tokens
                </span>
                <button className="w-5 h-5 rounded-full border border-gray-600 text-gray-600 text-xs flex items-center justify-center">
                  i
                </button>
              </div>
              <PowerUpTokens userId={initialUser.id} />
            </div>

            {/* Leaderboard */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Leaderboard
              </span>
              <Leaderboard />
            </div>

            {/* Next round countdown */}
            <div className="p-4 border-t border-[#D4AF3722] text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Next Round Starts In
              </div>
              <div className="text-3xl font-black text-nk-red">
                {phase === 'RESOLUTION' || phase === 'IDLE'
                  ? `${secondsLeft}s`
                  : 'LIVE'}
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

        {/* ── MOBILE LAYOUT (<lg) ── */}
        <div className="lg:hidden flex flex-col px-4 py-4 gap-4">

          {/* Recent results + Joker counter */}
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

          {/* Phase tracker */}
          <PhaseTracker />

          {/* Game card area */}
          <div className="relative bg-[#0D0000] border border-[#D4AF3722] rounded-2xl overflow-hidden p-4">

            {/* Multiplier */}
            <div className={`text-center text-7xl font-black mb-2 ${multColorClass}`}>
              {multLabel}
            </div>

            {/* Graph */}
            <div className="h-32">
              <MultiplierGraph />
            </div>

            {/* Card */}
            <div className="flex justify-center mt-4">
              <Card />
            </div>

          </div>

          {/* Live feed (collapsed on mobile) */}
          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-3 max-h-40 overflow-y-auto">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Live Feed</div>
            <LiveFeed />
          </div>

          {/* Bet panel */}
          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
            <BetPanel userId={initialUser.id} balance={balance} />
          </div>

          {/* Power-up tokens */}
          <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-2xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Power-Up Tokens</div>
            <PowerUpTokens userId={initialUser.id} />
          </div>

          {/* Next round countdown */}
          <div className="text-center py-2">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Next Round In</div>
            <div className="text-3xl font-black text-nk-red mt-1">
              {phase === 'RESOLUTION' || phase === 'IDLE' ? `${secondsLeft}s` : 'LIVE'}
            </div>
          </div>

        </div>
      </div>

      {/* VIP bar (desktop only) */}
      <VIPBar user={initialUser} />

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Sound toggle */}
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