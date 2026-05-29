'use client'
import { useBalance } from '@/lib/hooks/useBalance'

interface BalanceDisplayProps {
  userId?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-3xl',
}

export default function BalanceDisplay({ userId, size = 'md' }: BalanceDisplayProps) {
  const { balance, flashState } = useBalance(userId)

  return (
    <div className="text-right">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">Balance</div>
      <div
        className={`
          font-black text-nk-gold transition-all duration-300
          ${SIZE_CLASSES[size]}
          ${flashState === 'green' ? 'animate-balance-flash-green' : ''}
          ${flashState === 'red' ? 'animate-balance-flash-red' : ''}
        `}
      >
        {balance.toLocaleString()} KES
      </div>
    </div>
  )
}