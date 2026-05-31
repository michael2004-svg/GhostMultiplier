'use client'
import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useGame } from '@/lib/hooks/useGame'
import { getMultiplierColor } from '@/lib/multiplierUtils'
import { formatMultiplier } from '@/lib/gameEngine'
import toast from 'react-hot-toast'

const QUICK_AMOUNTS = [50, 100, 500, 1000, 5000]

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
  const [placing, setPlacing] = useState(false)

  const { placeBet, cashOut } = useGame(userId)

  const canBet = phase === 'BETTING' && !myBet && !!userId
  const canCashOut = (phase === 'MULTIPLIER' || phase === 'LOCK') && myBet?.locked

  const handlePlaceBet = useCallback(async () => {
    if (!colorChoice) { toast.error('Choose RED or BLACK first!'); return }
    if (amount < 10) { toast.error('Minimum bet is 10 KES'); return }
    if (amount > balance) { toast.error('Insufficient balance'); return }
    setPlacing(true)
    try {
      await placeBet(amount, colorChoice)
      toast.success('Bet locked in! 🔒')
    } catch (e: any) {
      toast.error(e.message ?? 'Bet failed')
    } finally {
      setPlacing(false)
    }
  }, [colorChoice, amount, balance, placeBet])

  const potentialPayout = myBet
    ? Math.floor(myBet.amount * multiplier)
    : Math.floor(amount * multiplier)

  const colorClass = getMultiplierColor(multiplier)

  return (
    <div className="space-y-4">

      {/* Color picker */}
      <div>
        <div className="text-[10px] text-gray-600 text-center mb-2.5 uppercase tracking-widest font-semibold">
          Choose Your Side
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {(['RED', 'BLACK'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setColorChoice(c)}
              disabled={!canBet}
              className={`relative py-4 px-3 rounded-xl font-black text-base flex flex-col items-center gap-1 transition-all duration-200 overflow-hidden border ${
                !canBet
                  ? 'opacity-40 cursor-not-allowed bg-white/5 border-white/10'
                  : colorChoice === c
                    ? c === 'RED'
                      ? 'bg-red-500/20 border-red-500/60 text-red-300 shadow-lg shadow-red-500/10'
                      : 'bg-gray-500/20 border-gray-400/40 text-gray-200 shadow-lg shadow-gray-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-400'
              }`}
            >
              {colorChoice === c && (
                <div className={`absolute inset-0 ${c === 'RED' ? 'bg-red-500/5' : 'bg-white/5'}`} />
              )}
              <span className="text-xl relative z-10">{c === 'RED' ? '♦' : '♠'}</span>
              <span className="text-sm relative z-10">{c}</span>
              <span className="text-[9px] opacity-60 font-normal relative z-10">47.5% WIN</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amount — only before bet is locked */}
      {!myBet && (
        <div>
          <div className="text-[10px] text-gray-600 text-center mb-2 uppercase tracking-widest font-semibold">
            Stake (KES)
          </div>
          <div className="relative mb-2">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-bold">KES</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-black text-xl text-center focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
              min={10}
              max={50000}
            />
          </div>
          <div className="flex gap-1.5">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                  amount === a
                    ? 'bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]'
                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-300'
                }`}
              >
                {a >= 1000 ? `${a / 1000}K` : a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payout preview */}
      {(myBet || colorChoice) && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 text-center">
          <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Potential Win</div>
          <div className={`text-2xl font-black ${colorClass}`}>
            {potentialPayout.toLocaleString()} KES
          </div>
          <div className="text-[11px] text-gray-600 mt-0.5">
            {formatMultiplier(multiplier)} · {(myBet?.amount ?? amount).toLocaleString()} KES stake
          </div>
        </div>
      )}

      {/* Action button */}
      {canCashOut ? (
        <button
          onClick={cashOut}
          className="w-full py-4 rounded-xl font-black text-lg text-black bg-green-400 hover:bg-green-300 transition-all active:scale-[0.98] shadow-lg shadow-green-400/20 flex flex-col items-center gap-0.5"
        >
          <span className="text-sm font-semibold">CASH OUT</span>
          <span className={`text-2xl ${colorClass}`}>{formatMultiplier(multiplier)}</span>
        </button>
      ) : (
        <button
          onClick={handlePlaceBet}
          disabled={!canBet || placing}
          className="w-full py-4 rounded-xl font-black text-base text-black transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#F0CA50] shadow-lg shadow-[#D4AF37]/20"
        >
          {placing ? (
            <>
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Placing...
            </>
          ) : (
            <>
              {phase === 'WAITING' ? 'Next Round Opens Soon' : 'PLACE BET'}
              {canBet && <span>🔒</span>}
            </>
          )}
        </button>
      )}

      {/* Locked status */}
      {myBet && (phase === 'MULTIPLIER' || phase === 'LOCK') && (
        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 bg-white/5 rounded-lg py-2">
          <span>🔒 LOCKED</span>
          <span className={`font-bold ${myBet.colorChoice === 'RED' ? 'text-red-400' : 'text-gray-300'}`}>
            {myBet.colorChoice}
          </span>
          <span>·</span>
          <span>{myBet.amount.toLocaleString()} KES</span>
        </div>
      )}
    </div>
  )
}