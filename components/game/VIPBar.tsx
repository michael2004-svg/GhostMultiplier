'use client'
import { getVIPProgress, getNextVIPLevel } from '@/lib/gameEngine'
import type { User } from '@/types/user'

interface VIPBarProps {
  user: User | null
}

const VIP_SHIELD_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#00CED1',
  Diamond: '#9B59B6',
}

export default function VIPBar({ user }: VIPBarProps) {
  if (!user) return null
  const progress = getVIPProgress(user.xp, user.vipLevel)
  const next = getNextVIPLevel(user.vipLevel)
  const color = VIP_SHIELD_COLORS[user.vipLevel] ?? '#CD7F32'
  const { min, max } = (() => {
    const thresholds: Record<string, { min: number; max: number }> = {
      Bronze: { min: 0, max: 5000 },
      Silver: { min: 5000, max: 20000 },
      Gold: { min: 20000, max: 50000 },
      Platinum: { min: 50000, max: 100000 },
      Diamond: { min: 100000, max: 100000 },
    }
    return thresholds[user.vipLevel] ?? thresholds.Bronze
  })()

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:right-auto lg:w-[240px] bg-[#0D0000] border-t border-[#D4AF3722] px-4 py-2 z-40 hidden lg:flex items-center gap-3">
      <span style={{ color }} className="text-xl">🛡</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color }}>VIP {user.vipLevel}</span>
          <span className="text-[10px] text-gray-500">
            {user.xp.toLocaleString()} / {max === Infinity ? '∞' : max.toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 bg-[#1A0000] rounded-full overflow-hidden">
          <div className="vip-bar h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}