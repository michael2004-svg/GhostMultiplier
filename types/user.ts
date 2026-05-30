import type { VIPLevel } from './game'

export interface User {
  id: string
  username: string
  email: string
  phone?: string
  balance: number
  total_wagered: number
  total_won: number
  vip_level: VIPLevel
  xp: number
  avatar_url?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS'
  amount: number
  reference?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  created_at: string
}