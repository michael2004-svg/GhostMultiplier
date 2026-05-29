'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@/types/user'
import { getVIPProgress, getNextVIPLevel } from '@/lib/gameEngine'

interface SidebarProps {
  user: User | null
  side: 'left' | 'right'
}

const LEFT_NAV = [
  { href: '/game', icon: '👑', label: 'Game' },
  { href: '/wallet', icon: '💳', label: 'Wallet' },
  { href: '/history', icon: '🕐', label: 'History' },
  { href: '/profile', icon: '👤', label: 'Profile' },
  { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
]

export default function Sidebar({ user, side }: SidebarProps) {
  const pathname = usePathname()

  if (side === 'left') {
    return (
      <aside className="hidden xl:flex flex-col w-[200px] border-r border-[#D4AF3722] pt-20 pb-16">
        <nav className="flex-1 px-3 pt-4">
          {LEFT_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 font-bold text-sm transition-all ${
                pathname === item.href
                  ? 'bg-[#1A0000] text-nk-gold border border-[#D4AF3733]'
                  : 'text-gray-500 hover:text-white hover:bg-[#1A0000]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* VIP section at bottom */}
        {user && (
          <div className="px-3 py-4 border-t border-[#D4AF3722]">
            <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">VIP Status</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-nk-gold text-sm">🛡</span>
              <span className="text-sm font-bold text-nk-gold">{user.vipLevel}</span>
            </div>
            <div className="h-1.5 bg-[#1A0000] rounded-full">
              <div
                className="vip-bar h-full rounded-full"
                style={{ width: `${getVIPProgress(user.xp, user.vipLevel)}%` }}
              />
            </div>
            {getNextVIPLevel(user.vipLevel) && (
              <div className="text-[10px] text-gray-600 mt-1">
                Next: {getNextVIPLevel(user.vipLevel)}
              </div>
            )}
          </div>
        )}
      </aside>
    )
  }

  // Right sidebar is handled by game layout (leaderboard + tokens)
  return null
}