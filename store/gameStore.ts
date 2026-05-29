import { create } from 'zustand'
import type { Phase, Color, LivePlayer, GameState } from '@/types/game'

interface GameStore extends GameState {
  setPhase: (phase: Phase, phaseEndsAt: number) => void
  startRound: (roundId: string, roundNumber: number, hash: string) => void
  setMultiplier: (value: number, t: number) => void
  setFlipResult: (color: Color) => void
  lockBet: (amount: number, colorChoice: 'RED' | 'BLACK') => void
  clearBet: () => void
  triggerJoker: () => void
  endRound: () => void
  addToFeed: (player: LivePlayer) => void
  setPlayerCount: (count: number) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'IDLE',
  roundId: null,
  roundNumber: 0,
  hash: null,
  multiplier: 1.0,
  multiplierHistory: [],
  phaseEndsAt: null,
  outcomeColor: null,
  crashMultiplier: null,
  playerCount: 0,
  recentResults: [],
  liveFeed: [],
  myBet: null,
  jokerActive: false,
  jokerCountdown: 20,

  setPhase: (phase, phaseEndsAt) => set({ phase, phaseEndsAt }),

  startRound: (roundId, roundNumber, hash) => set({
    roundId,
    roundNumber,
    hash,
    phase: 'BETTING',
    multiplier: 1.0,
    multiplierHistory: [],
    outcomeColor: null,
    crashMultiplier: null,
    myBet: null,
    jokerActive: false,
  }),

  setMultiplier: (value, t) => set((s) => ({
    multiplier: value,
    multiplierHistory: [...s.multiplierHistory, { t, v: value }],
  })),

  setFlipResult: (color) => set((s) => ({
    outcomeColor: color,
    recentResults: [color, ...s.recentResults].slice(0, 10),
  })),

  lockBet: (amount, colorChoice) => set({
    myBet: { amount, colorChoice, locked: true },
  }),

  clearBet: () => set({ myBet: null }),

  triggerJoker: () => set({ jokerActive: true }),

  endRound: () => set({ jokerActive: false }),

  addToFeed: (player) => set((s) => ({
    liveFeed: [player, ...s.liveFeed].slice(0, 20),
  })),

  setPlayerCount: (count) => set({ playerCount: count }),
}))