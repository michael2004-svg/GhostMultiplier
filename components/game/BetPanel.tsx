'use client'
import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/lib/hooks/useGame'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000]

interface BetPanelProps {
  userId?: string
  balance: number
}

export default function BetPanel({ userId, balance }: BetPanelProps) {
  const phase = useGameStore((s) => s.phase)
  const myBet = useGameStore((s) => s.myBet)
  const multiplier = useGameStore((s) => s.multiplier)

  const [amount, setAmount] = useState(500)
  const [colorChoice, setColorChoice] = useState<'RED' | 'BLACK' | null>(null)

  const { placeBet, cashOut } = useGame(userId)

  const canBet = phase === 'BETTING' && !myBet && userId
  const canCashOut = (phase === 'MULTIPLIER' || phase === 'LOCK') && myBet?.locked

  const handlePlaceBet = useCallback(async () => {
    if (!colorChoice) { toast.error('Choose RED or BLACK first!'); return }
    if (amount < 10) { toast.error('Minimum bet is 10 KES'); return }
    if (amount > balance) { toast.error('Insufficient balance'); return }
    await placeBet(amount, colorChoice)
    toast.success(`Bet locked in at ${phase === 'BETTING' ? '2s' : 'now'}`)
  }, [colorChoice, amount, balance, placeBet, phase])

  const potentialPayout = myBet ? Math.floor(myBet.amount * multiplier) : Math.floor(amount * multiplier)

  return (
    <div className="space-y-4">
      {/* Color choice */}
      <div>
        <div className="text-xs text-gray-500 text-center mb-2 uppercase tracking-wider">Choose Your Color</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setColorChoice('RED')}
            disabled={!canBet}
            className={`btn-red py-4 px-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              colorChoice === 'RED' ? 'selected' : ''
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span>♦</span>
            <div className="text-left">
              <div>RED</div>
              <div className="text-xs font-normal opacity-75">47.5% WIN</div>
            </div>
          </button>
          <button
            onClick={() => setColorChoice('BLACK')}
            disabled={!canBet}
            className={`btn-black py-4 px-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              colorChoice === 'BLACK' ? 'selected' : ''
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <span>♠</span>
            <div className="text-left">
              <div>BLACK</div>
              <div className="text-xs font-normal opacity-75">47.5% WIN</div>
            </div>
          </button>
        </div>
      </div>

      {/* Bet amount */}
      {!myBet && (
        <div>
          <div className="text-xs text-gray-500 text-center mb-2 uppercase tracking-wider">Bet Amount (KES)</div>
          <div className="flex items-center gap-2 bg-[#0D0000] border border-[#333] rounded-xl px-4 py-3 mb-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
              className="flex-1 bg-transparent text-white font-black text-xl text-center focus:outline-none"
              min={10}
              max={50000}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`flex-1 min-w-0 py-2 rounded-lg text-sm font-bold transition-all border ${
                  amount === a
                    ? 'bg-nk-red border-nk-red text-white'
                    : 'bg-[#1A0000] border-[#333] text-gray-400 hover:border-nk-red hover:text-white'
                }`}
              >
                {a >= 1000 ? `${a / 1000}K` : a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payout display */}
      {(myBet || colorChoice) && (
        <div className="bg-[#0D0000] border border-[#D4AF3722] rounded-xl p-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Potential Payout</div>
          <div className="text-2xl font-black text-nk-red">{potentialPayout.toLocaleString()} KES</div>
          <div className="text-xs text-gray-500">Your Bet: {(myBet?.amount ?? amount).toLocaleString()} KES</div>
        </div>
      )}

      {/* Action buttons */}
      {canCashOut ? (
        <button
          onClick={cashOut}
          className="btn-cashout w-full py-4 rounded-xl font-black text-xl text-white transition-all"
        >
          CASH OUT {multiplier.toFixed(2)}x
        </button>
      ) : (
        <button
          onClick={handlePlaceBet}
          disabled={!canBet}
          className="btn-place-bet w-full py-4 rounded-xl font-black text-lg text-white transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          PLACE BET (LOCK IN)
          <span>🔒</span>
        </button>
      )}

      {myBet && phase === 'MULTIPLIER' && (
        <div className="text-center text-xs text-gray-500">
          BET LOCKED IN • {myBet.colorChoice} • {myBet.amount.toLocaleString()} KES
        </div>
      )}
    </div>
  )
}