'use client'
import type { User } from '@/types/user'

interface VIPBarProps {
  user: User | null
}

const VIP_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#00CED1',
  Diamond: '#9B59B6',
}

const VIP_THRESHOLDS: Record<string, { min: number; max: number }> = {
  Bronze:   { min: 0,      max: 5000  },
  Silver:   { min: 5000,   max: 20000 },
  Gold:     { min: 20000,  max: 50000 },
  Platinum: { min: 50000,  max: 100000 },
  Diamond:  { min: 100000, max: 100000 },
}

export default function VIPBar({ user }: VIPBarProps) {
  if (!user) return null

  const level = user.vipLevel ?? 'Bronze'
  const color = VIP_COLORS[level] ?? '#CD7F32'
  const { min, max } = VIP_THRESHOLDS[level] ?? VIP_THRESHOLDS.Bronze
  const progress = max === min ? 100 : Math.min(100, ((user.xp - min) / (max - min)) * 100)

  const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const nextLevel = levels[levels.indexOf(level) + 1] ?? null

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:right-auto lg:w-[240px] bg-[#0D0000] border-t border-[#D4AF3722] px-4 py-2 z-40 hidden lg:flex items-center gap-3">
      <span style={{ color }} className="text-xl flex-shrink-0">🛡</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold" style={{ color }}>
            VIP {level}
          </span>
          <span className="text-[10px] text-gray-500">
            {(user.xp ?? 0).toLocaleString()} XP
          </span>
        </div>
        <div className="h-1.5 bg-[#1A0000] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${color}, #F39C12)`,
              boxShadow: `0 0 8px ${color}66`,
            }}
          />
        </div>
        {nextLevel && (
          <div className="text-[9px] text-gray-600 mt-0.5">Next: {nextLevel}</div>
        )}
      </div>
    </div>
  )
}

