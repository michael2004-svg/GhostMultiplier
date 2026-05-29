'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { getSocket } from '@/lib/socket'
import type { Phase, Color, LivePlayer } from '@/types/game'
import { getMultiplierAtTime } from '@/lib/rng'

export function useGame(userId?: string) {
  const store = useGameStore()
  const tickerRef = useRef<NodeJS.Timeout | null>(null)
  const phaseStartRef = useRef<number>(Date.now())
  const maxMultiplierRef = useRef<number>(2)

  const startMultiplierTick = useCallback((maxMult: number) => {
    maxMultiplierRef.current = maxMult
    phaseStartRef.current = Date.now()
    if (tickerRef.current) clearInterval(tickerRef.current)

    tickerRef.current = setInterval(() => {
      const elapsed = (Date.now() - phaseStartRef.current) / 1000
      if (elapsed >= 5) {
        clearInterval(tickerRef.current!)
        return
      }
      const value = getMultiplierAtTime(elapsed, maxMult)
      store.setMultiplier(value, elapsed)
    }, 100)
  }, [store])

  useEffect(() => {
    const socket = getSocket()

    socket.on('round:start', (data: {
      roundId: string
      roundNumber: number
      hash: string
      phase: Phase
      phaseEndsAt: number
      maxMultiplier: number
    }) => {
      store.startRound(data.roundId, data.roundNumber, data.hash)
      store.setPhase('BETTING', data.phaseEndsAt)
      maxMultiplierRef.current = data.maxMultiplier
    })

    socket.on('round:phase', (data: { phase: Phase; phaseEndsAt: number }) => {
      store.setPhase(data.phase, data.phaseEndsAt)
      if (data.phase === 'MULTIPLIER') {
        startMultiplierTick(maxMultiplierRef.current)
      }
      if (data.phase === 'LOCK' || data.phase === 'FLIP') {
        if (tickerRef.current) clearInterval(tickerRef.current)
      }
    })

    socket.on('round:flip', (data: { color: Color; serverSeed: string }) => {
      store.setFlipResult(data.color)
      if (data.color === 'JOKER') store.triggerJoker()
    })

    socket.on('round:end', () => {
      store.endRound()
    })

    socket.on('feed:update', (player: LivePlayer) => {
      store.addToFeed(player)
    })

    socket.on('players:count', (data: { count: number }) => {
      store.setPlayerCount(data.count)
    })

    return () => {
      socket.off('round:start')
      socket.off('round:phase')
      socket.off('round:flip')
      socket.off('round:end')
      socket.off('feed:update')
      socket.off('players:count')
      if (tickerRef.current) clearInterval(tickerRef.current)
    }
  }, [store, startMultiplierTick])

  const placeBet = useCallback(async (
    amount: number,
    colorChoice: 'RED' | 'BLACK'
  ) => {
    if (!store.roundId || !userId) return
    const socket = getSocket()
    socket.emit('bet:place', {
      roundId: store.roundId,
      userId,
      amount,
      colorChoice,
    })
    store.lockBet(amount, colorChoice)
  }, [store, userId])

  const cashOut = useCallback(() => {
    if (!store.roundId || !userId) return
    const socket = getSocket()
    socket.emit('bet:cashout', {
      roundId: store.roundId,
      userId,
      currentMultiplier: store.multiplier,
    })
  }, [store, userId])

  const useToken = useCallback((tokenType: 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN') => {
    if (!store.roundId || !userId) return
    const socket = getSocket()
    socket.emit('token:use', {
      roundId: store.roundId,
      userId,
      tokenType,
    })
  }, [store, userId])

  return { placeBet, cashOut, useToken }
}