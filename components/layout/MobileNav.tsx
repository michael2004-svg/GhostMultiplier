'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
  { href: '/game', icon: '👑', label: 'Game' },
  { href: '/history', icon: '🕐', label: 'History' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0D0000] border-t border-[#D4AF3722] z-50 flex">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-semibold transition-all ${
              active ? 'mobile-nav-item active text-nk-gold' : 'text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}