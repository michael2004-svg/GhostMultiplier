import type { VIPLevel } from './game'

export interface User {
  id: string
  username: string
  email: string
  phone?: string
  balance: number
  totalWagered: number
  totalWon: number
  vipLevel: VIPLevel
  xp: number
  avatarUrl?: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS'
  amount: number
  reference?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  createdAt: string
}