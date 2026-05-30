'use client'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/lib/hooks/useGame'
import { getMultiplierColor } from '@/lib/multiplierUtils'
import { formatMultiplier } from '@/lib/gameEngine'

interface CashOutButtonProps {
  userId?: string
}

export default function CashOutButton({ userId }: CashOutButtonProps) {
  const phase = useGameStore((s) => s.phase)
  const multiplier = useGameStore((s) => s.multiplier)
  const myBet = useGameStore((s) => s.myBet)
  const { cashOut } = useGame(userId)

  const canCashOut = (phase === 'MULTIPLIER' || phase === 'LOCK') && myBet?.locked

  if (!canCashOut) return null

  const payout = myBet ? Math.floor(myBet.amount * multiplier) : 0

  return (
    <div className="space-y-2">
      <button
        onClick={cashOut}
        className="btn-cashout w-full py-5 rounded-xl font-black text-2xl text-white transition-all flex flex-col items-center"
      >
        <span>CASH OUT</span>
        <span className={`text-3xl font-black ${getMultiplierColor(multiplier)}`}>
          {formatMultiplier(multiplier)}
        </span>
      </button>
      <div className="text-center text-xs text-gray-500">
        You'll receive{' '}
        <span className="text-nk-green font-bold">{payout.toLocaleString()} KES</span>
      </div>
    </div>
  )
}