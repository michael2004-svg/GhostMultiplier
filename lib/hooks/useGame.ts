'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { createClient } from '@/lib/supabase/client'
import type { Phase, Color, LivePlayer, GameState } from '@/types/game'

const supabase = createClient()

// Fetch current game state from server on mount/reconnect so refresh always shows live state
async function fetchCurrentGameState(): Promise<Partial<GameState> | null> {
  try {
    const res = await fetch('/api/game/state')
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Fetch last 10 rounds from Supabase
async function fetchRecentResults(): Promise<Color[]> {
  try {
    const { data } = await supabase
      .from('rounds')
      .select('outcomeColor')
      .not('outcomeColor', 'is', null)
      .order('roundNumber', { ascending: false })
      .limit(10)
    return (data ?? []).map((r: any) => r.outcomeColor as Color)
  } catch {
    return []
  }
}

export function useGame(userId?: string) {
  const store = useGameStore()
  const storeRef = useRef(store)
  storeRef.current = store

  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  useEffect(() => {
    // On mount: sync current server state so refreshes don't show stale WAITING
    fetchCurrentGameState().then((state) => {
      if (state) storeRef.current.syncFromServer(state)
    })

    // Load recent results from DB
    fetchRecentResults().then((results) => {
      if (results.length > 0) storeRef.current.setRecentResults(results)
    })

    if (channelRef.current) return

    const channel = supabase.channel('game:live', {
      config: { broadcast: { ack: false } },
    })
    channelRef.current = channel

    channel
      .on('broadcast' as any, { event: 'round:start' }, ({ payload }: { payload: any }) => {
        storeRef.current.startRound(payload.roundId, payload.roundNumber, payload.hash)
        storeRef.current.setPhase('BETTING', payload.phaseEndsAt)
      })
      .on('broadcast' as any, { event: 'round:waiting' }, ({ payload }: { payload: any }) => {
        storeRef.current.setWaiting(payload.nextRoundAt)
        // Persist result to DB-backed recentResults
        fetchRecentResults().then((results) => {
          if (results.length > 0) storeRef.current.setRecentResults(results)
        })
      })
      .on('broadcast' as any, { event: 'round:phase' }, ({ payload }: { payload: any }) => {
        storeRef.current.setPhase(payload.phase as Phase, payload.phaseEndsAt)
      })
      .on('broadcast' as any, { event: 'round:multiplier' }, ({ payload }: { payload: any }) => {
        const start = payload.phaseStartedAt ?? (storeRef.current.phaseEndsAt ?? Date.now() - 5000)
        const elapsed = (Date.now() - start) / 1000
        storeRef.current.setMultiplier(payload.value, elapsed)
      })
      .on('broadcast' as any, { event: 'round:flip' }, ({ payload }: { payload: any }) => {
        storeRef.current.setFlipResult(payload.color as Color)
        if (payload.color === 'JOKER') storeRef.current.triggerJoker()
      })
      .on('broadcast' as any, { event: 'round:end' }, (_: any) => {
        storeRef.current.endRound()
      })
      .on('broadcast' as any, { event: 'feed:update' }, ({ payload }: { payload: any }) => {
        storeRef.current.addToFeed(payload as LivePlayer)
      })
      .on('broadcast' as any, { event: 'players:count' }, ({ payload }: { payload: any }) => {
        storeRef.current.setPlayerCount(payload.count)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Re-sync state after reconnect
          fetchCurrentGameState().then((state) => {
            if (state) storeRef.current.syncFromServer(state)
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [])

  const placeBet = useCallback(async (amount: number, colorChoice: 'RED' | 'BLACK') => {
    if (!store.roundId || !userId) return
    const res = await fetch('/api/bets/place', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roundId: store.roundId, amount, colorChoice }),
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
      body: JSON.stringify({ userId, roundId: store.roundId, currentMultiplier: store.multiplier }),
    })
  }, [store, userId])

  const useToken = useCallback(async (tokenType: 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN') => {
    if (!store.roundId || !userId) return
    await fetch('/api/tokens/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roundId: store.roundId, tokenType }),
    })
  }, [store, userId])

  return { placeBet, cashOut, useToken }
}