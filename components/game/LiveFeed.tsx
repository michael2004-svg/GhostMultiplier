'use client'
import { useGameStore } from '@/store/gameStore'
import { formatKES } from '@/lib/gameEngine'
import type { LivePlayer } from '@/types/game'

function FeedItem({ player }: { player: LivePlayer }) {
  const isWin = player.action === 'WIN' || player.action === 'CASHOUT'
  const isLoss = player.action === 'LOSS'
  const isBet = player.action === 'BET'

  return (
    <div className="feed-item flex items-start gap-2 py-2 border-b border-[#ffffff08]">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nk-gold to-nk-red flex-shrink-0 flex items-center justify-center text-xs font-bold">
        {player.avatarUrl ? (
          <img src={player.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
        ) : (
          player.username[0].toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className={`font-bold text-sm truncate ${player.vipLevel === 'Gold' || player.vipLevel === 'Diamond' ? 'text-nk-gold' : 'text-white'}`}>
            {player.username}
          </span>
        </div>
        <div className="text-xs text-gray-500 leading-tight">
          {isBet && (
            <>bet {player.amount.toLocaleString()} KES on{' '}
              <span className={player.color === 'RED' ? 'text-red-400' : 'text-gray-300'}>
                {player.color}
              </span>
            </>
          )}
          {player.action === 'CASHOUT' && (
            <>cashed out at <span className="text-nk-orange">{player.multiplier?.toFixed(2)}x</span></>
          )}
          {player.action === 'WIN' && 'won this round'}
          {player.action === 'LOSS' && 'lost this round'}
          {player.action === 'STILL_IN' && 'is still in...'}
        </div>
        {isWin && player.profit && (
          <div className="text-xs text-nk-green font-bold">+{player.profit.toLocaleString()} KES</div>
        )}
      </div>
    </div>
  )
}

export default function LiveFeed() {
  const liveFeed = useGameStore((s) => s.liveFeed)
  const playerCount = useGameStore((s) => s.playerCount)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Players</span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 font-bold">{playerCount.toLocaleString()}</span>
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0 scrollbar-thin">
        {liveFeed.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-8">Waiting for players...</div>
        ) : (
          liveFeed.map((p, i) => <FeedItem key={`${p.userId}-${i}`} player={p} />)
        )}
      </div>
    </div>
  )
}