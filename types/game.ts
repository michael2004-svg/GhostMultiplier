export type Phase = 'WAITING' | 'BETTING' | 'MULTIPLIER' | 'LOCK' | 'FLIP' | 'RESOLUTION'
export type Color = 'RED' | 'BLACK' | 'JOKER'
export type BetOutcome = 'WIN' | 'LOSS' | 'CASHOUT' | 'JOKER' | null
export type TokenType = 'PEEK' | 'SHIELD' | 'DOUBLE_DOWN'
export type VIPLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

export interface Round {
  id: string
  roundNumber: number
  serverSeed?: string
  clientSeed: string
  hash: string
  outcomeColor?: Color
  crashMultiplier?: number
  startedAt: string
  endedAt?: string
  phase: Phase
}

export interface Bet {
  id: string
  roundId: string
  userId: string
  amount: number
  colorChoice: 'RED' | 'BLACK'
  cashoutAt?: number
  cashoutAmount?: number
  outcome: BetOutcome
  profit?: number
  placedAt: string
}

export interface LivePlayer {
  userId: string
  username: string
  avatarUrl?: string
  action: 'BET' | 'CASHOUT' | 'WIN' | 'LOSS' | 'STILL_IN'
  amount: number
  color?: 'RED' | 'BLACK'
  multiplier?: number
  profit?: number
  timestamp: number
  vipLevel?: VIPLevel
}

export interface LeaderboardEntry {
  rank: number
  username: string
  avatarUrl?: string
  vipLevel: VIPLevel
  totalProfit: number
  totalBets: number
}

export interface GameState {
  phase: Phase
  roundId: string | null
  roundNumber: number
  hash: string | null
  multiplier: number
  multiplierHistory: { t: number; v: number }[]
  phaseEndsAt: number | null
  nextRoundAt: number | null
  outcomeColor: Color | null
  crashMultiplier: number | null
  playerCount: number
  recentResults: Color[]
  liveFeed: LivePlayer[]
  myBet: {
    amount: number
    colorChoice: 'RED' | 'BLACK'
    locked: boolean
  } | null
  jokerActive: boolean
  jokerCountdown: number
}

export interface PowerUpToken {
  type: TokenType
  cost: number
  description: string
  icon: string
  label: string
}

export const POWER_UP_TOKENS: PowerUpToken[] = [
  { type: 'PEEK', cost: 5, description: '60% accuracy', icon: '👁', label: 'PEEK TOKEN' },
  { type: 'SHIELD', cost: 10, description: 'Protects 50%', icon: '🛡', label: 'SHIELD TOKEN' },
  { type: 'DOUBLE_DOWN', cost: 20, description: 'Double your bet', icon: '2×', label: 'DOUBLE DOWN' },
]