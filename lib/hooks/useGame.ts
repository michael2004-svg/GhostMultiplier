'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { createClient } from '@/lib/supabase/client'
import type { Phase, Color, LivePlayer } from '@/types/game'

export function useGame(userId?: string) {
  const store = useGameStore()
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase.channel('game', {
      config: { broadcast: { listen: true } },
    })

    channelRef.current = channel

    channel
      .on('broadcast', { event: 'round:start' }, ({ payload }) => {
        store.startRound(payload.roundId, payload.roundNumber, payload.hash)
        store.setPhase('BETTING', payload.phaseEndsAt)
      })
      .on('broadcast', { event: 'round:phase' }, ({ payload }) => {
        store.setPhase(payload.phase as Phase, payload.phaseEndsAt)
        if (payload.phase === 'LOCK' || payload.phase === 'FLIP') {
          // stop any local ticker
        }
      })
      .on('broadcast', { event: 'round:multiplier' }, ({ payload }) => {
        const elapsed = (Date.now() - (store.phaseEndsAt ?? Date.now() - 5000)) / 1000
        store.setMultiplier(payload.value, elapsed)
      })
      .on('broadcast', { event: 'round:flip' }, ({ payload }) => {
        store.setFlipResult(payload.color as Color)
        if (payload.color === 'JOKER') store.triggerJoker()
      })
      .on('broadcast', { event: 'round:end' }, () => {
        store.endRound()
      })
      .on('broadcast', { event: 'feed:update' }, ({ payload }) => {
        store.addToFeed(payload as LivePlayer)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [store])

  const placeBet = useCallback(async (
    amount: number,
    colorChoice: 'RED' | 'BLACK'
  ) => {
    if (!store.roundId || !userId) return

    const res = await fetch('/api/bets/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        roundId: store.roundId,
        amount,
        colorChoice,
      }),
    })

    if (res.ok) {
      store.lockBet(amount, colorChoice)
    } else {
      const { error } = await res.json()
      throw new Error(error ?? 'Bet failed')
    }
  }, [store, userId])

  const cashOut = useCallback(async () => {
    if (!store.roundId || !userId) return

    await fetch('/api/bets/cashout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        roundId: store.roundId,
        currentMultiplier: store.multiplier,
      }),
    })
  }, [store, userId])

  const useToken = useCallback(async (tokenType: 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN') => {
    if (!store.roundId || !userId) return

    await fetch('/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        roundId: store.roundId,
        tokenType,
      }),
    })
  }, [store, userId])

  return { placeBet, cashOut, useToken }
}