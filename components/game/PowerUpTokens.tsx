'use client'
import { useState } from 'react'
import { useGame } from '@/lib/hooks/useGame'
import { useGameStore } from '@/store/gameStore'
import { POWER_UP_TOKENS } from '@/types/game'
import toast from 'react-hot-toast'

interface PowerUpTokensProps {
  userId?: string
}

export default function PowerUpTokens({ userId }: PowerUpTokensProps) {
  const phase = useGameStore((s) => s.phase)
  const myBet = useGameStore((s) => s.myBet)
  const { useToken } = useGame(userId)
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUseToken(tokenType: 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN') {
    if (!userId || !myBet) { toast.error('Place a bet first!'); return }
    if (tokenType === 'DOUBLE_DOWN' && phase !== 'LOCK') {
      toast.error('Double Down only available in Lock phase!')
      return
    }
    setLoading(tokenType)
    useToken(tokenType)
    if (tokenType === 'PEEK') {
      const hint = Math.random() > 0.4
        ? myBet.colorChoice
        : (myBet.colorChoice === 'RED' ? 'BLACK' : 'RED')
      setTimeout(() => {
        toast(`🔮 The Oracle sees... ${hint}`, { icon: '👁', duration: 3000 })
        setLoading(null)
      }, 1000)
    } else {
      setLoading(null)
    }
  }

  const iconMap: Record<string, React.ReactNode> = {
    PEEK: <span className="text-2xl">👁</span>,
    SHIELD: <span className="text-2xl">🛡</span>,
    DOUBLE_DOWN: <span className="text-xl font-black text-nk-gold">2×</span>,
  }

  const colorMap: Record<string, string> = {
    PEEK: 'border-purple-800 hover:border-purple-500',
    SHIELD: 'border-blue-800 hover:border-blue-500',
    DOUBLE_DOWN: 'border-yellow-800 hover:border-yellow-500',
  }

  return (
    <div className="space-y-2">
      {POWER_UP_TOKENS.map((token) => (
        <button
          key={token.type}
          onClick={() => handleUseToken(token.type)}
          disabled={loading === token.type}
          className={`token-btn w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${colorMap[token.type]} disabled:opacity-50`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0D0000] flex items-center justify-center flex-shrink-0">
              {iconMap[token.type]}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white">{token.label}</div>
              <div className="text-[10px] text-gray-500">{token.description}</div>
            </div>
          </div>
          <div className="bg-nk-green text-white text-xs font-black px-3 py-1 rounded-full flex-shrink-0">
            {token.cost} KES
          </div>
        </button>
      ))}
    </div>
  )
}