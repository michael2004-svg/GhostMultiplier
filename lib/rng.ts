// SERVER ONLY — do not import this in client components
import crypto from 'crypto'
import type { Color } from '@/types/game'

export function generateRoundOutcome(
  serverSeed: string,
  clientSeed: string,
  roundId: string
): { color: Color; multiplier: number } {
  const hash = crypto
    .createHmac('sha256', serverSeed)
    .update(`${clientSeed}-${roundId}`)
    .digest('hex')

  const byte = parseInt(hash.slice(0, 8), 16)
  const normalized = byte / 0xffffffff

  if (normalized < 0.475) return { color: 'RED', multiplier: generateMultiplier(hash) }
  if (normalized < 0.950) return { color: 'BLACK', multiplier: generateMultiplier(hash) }
  return { color: 'JOKER', multiplier: 0 }
}

function generateMultiplier(hash: string): number {
  const byte = parseInt(hash.slice(8, 16), 16)
  const r = byte / 0xffffffff
  return parseFloat(Math.max(1.0, (1 / (1 - r)) * 0.95).toFixed(2))
}

export function generateServerSeed(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateClientSeed(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function hashSeeds(serverSeed: string, clientSeed: string): string {
  return crypto
    .createHmac('sha256', serverSeed)
    .update(clientSeed)
    .digest('hex')
}