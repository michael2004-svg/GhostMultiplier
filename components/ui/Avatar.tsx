'use client'
import type { VIPLevel } from '@/types/game'

interface AvatarProps {
  username?: string
  avatarUrl?: string
  vipLevel?: VIPLevel
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showBorder?: boolean
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

const VIP_BORDER_COLORS: Record<VIPLevel, string> = {
  Bronze: 'border-amber-600',
  Silver: 'border-gray-400',
  Gold: 'border-yellow-400',
  Platinum: 'border-cyan-400',
  Diamond: 'border-purple-400',
}

export default function Avatar({
  username = '?',
  avatarUrl,
  vipLevel,
  size = 'md',
  showBorder = false,
}: AvatarProps) {
  const borderClass =
    showBorder && vipLevel ? `border-2 ${VIP_BORDER_COLORS[vipLevel]}` : ''

  return (
    <div
      className={`
        ${SIZE_CLASSES[size]}
        ${borderClass}
        rounded-full overflow-hidden flex-shrink-0
        bg-gradient-to-br from-nk-gold to-nk-red
        flex items-center justify-center
        font-black text-white uppercase
      `}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        username[0]
      )}
    </div>
  )
}