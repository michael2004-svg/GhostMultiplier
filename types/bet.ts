export type BetOutcome = 'WIN' | 'LOSS' | 'CASHOUT' | 'JOKER'

export interface Bet {
  id: string
  roundId: string
  userId: string
  amount: number
  colorChoice: 'RED' | 'BLACK'
  cashoutAt?: number
  cashoutAmount?: number
  outcome?: BetOutcome
  profit?: number
  placedAt: string
}

export interface BetWithRound extends Bet {
  round: {
    roundNumber: number
    outcomeColor: string
    crashMultiplier: number
    clientSeed: string
    serverSeed: string
  }
}

export interface PlaceBetPayload {
  roundId: string
  userId: string
  amount: number
  colorChoice: 'RED' | 'BLACK'
}

export interface CashoutPayload {
  roundId: string
  userId: string
  currentMultiplier: number
}