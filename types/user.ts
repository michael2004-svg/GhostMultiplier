import type { VIPLevel } from './game'

export interface User {
  id: string
  username: string
  email: string
  phone?: string
  balance: number
  total_wagered: number
  total_won: number
  vipLevel: VIPLevel       // was vip_level
  xp: number
  avatarUrl?: string       // was avatar_url
  created_at: string
}

export interface Transaction {
  id: string
  userId: string           // was user_id
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET' | 'WIN' | 'BONUS'
  amount: number
  reference?: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  created_at: string
}
