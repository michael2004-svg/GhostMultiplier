'use client'
import { useGameStore } from '@/store/gameStore'
import type { LivePlayer } from '@/types/game'

function FeedItem({ player, isNew }: { player: LivePlayer; isNew: boolean }) {
  const isWin = player.action === 'WIN' || player.action === 'CASHOUT'
  const isLoss = player.action === 'LOSS'
  const isBet = player.action === 'BET'
  const isStillIn = player.action === 'STILL_IN'

  const actionColor = isWin ? 'text-green-400' : isLoss ? 'text-red-400' : isBet ? 'text-gray-400' : 'text-yellow-400'

  return (
    <div
      className={`flex items-center gap-2.5 py-2.5 px-2 rounded-lg border border-transparent transition-all duration-500 ${
        isNew ? 'bg-white/5 border-white/10 animate-feed-in' : ''
      }`}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37]/60 to-[#D4AF37]/20 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-[#D4AF37] overflow-hidden border border-[#D4AF37]/20">
        {player.avatarUrl ? (
          <img src={player.avatarUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          player.username[0]?.toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`font-bold text-xs truncate ${
            player.vipLevel === 'Diamond' ? 'text-cyan-300' :
            player.vipLevel === 'Gold' ? 'text-[#D4AF37]' : 'text-white'
          }`}>
            {player.username}
          </span>
          {isWin && player.profit && (
            <span className="text-green-400 text-xs font-black flex-shrink-0">
              +{player.profit >= 1000 ? `${(player.profit / 1000).toFixed(1)}K` : player.profit} KES
            </span>
          )}
        </div>
        <div className={`text-[11px] leading-tight ${actionColor}`}>
          {isBet && (
            <>
              Bet {player.amount >= 1000 ? `${(player.amount / 1000).toFixed(0)}K` : player.amount} KES
              {player.color && (
                <span className={` on ${player.color === 'RED' ? 'text-red-400' : 'text-gray-300'}`}>
                  {' '}on {player.color}
                </span>
              )}
            </>
          )}
          {player.action === 'CASHOUT' && (
            <>Cashed out @ <span className="font-bold">{player.multiplier?.toFixed(2)}x</span></>
          )}
          {player.action === 'WIN' && 'Won this round 🎉'}
          {player.action === 'LOSS' && 'Lost this round'}
          {isStillIn && 'Still in...'}
        </div>
      </div>
    </div>
  )
}

export default function LiveFeed() {
  const liveFeed = useGameStore((s) => s.liveFeed)
  const playerCount = useGameStore((s) => s.playerCount)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Activity</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-bold">{playerCount.toLocaleString()}</span>
          <span className="text-gray-600 text-[10px]">online</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
        {liveFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2">
            <div className="w-6 h-6 border border-white/10 rounded-full animate-spin border-t-[#D4AF37]/40" />
            <span className="text-gray-700 text-xs">Waiting for activity...</span>
          </div>
        ) : (
          liveFeed.map((p, i) => (
            <FeedItem key={`${p.userId}-${p.timestamp}-${i}`} player={p} isNew={i === 0} />
          ))
        )}
      </div>
    </div>
  )
}