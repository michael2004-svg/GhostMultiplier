import type { Phase, Color } from './game'

export interface Round {
  id: string
  roundNumber: number
  serverSeed?: string   // revealed after round ends
  clientSeed: string
  hash: string          // published before round starts
  outcomeColor?: Color
  crashMultiplier?: number
  startedAt: string
  endedAt?: string
  phase: Phase
}

export interface RoundResult {
  roundId: string
  roundNumber: number
  outcomeColor: Color
  crashMultiplier: number
  serverSeed: string    // revealed for provably fair verification
  clientSeed: string
  hash: string
  totalBets: number
  totalWagered: number
  houseProfit: number
}