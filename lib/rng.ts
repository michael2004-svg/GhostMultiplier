import type { Color } from '@/types/game'

// ── Browser-safe helpers ─────────────────────────────────────────────────────
// These have no Node.js dependencies and can be imported anywhere

export function getMultiplierColor(multiplier: number): string {
  if (multiplier < 1.5) return 'mult-white'
  if (multiplier < 2.0) return 'mult-yellow'
  if (multiplier < 2.5) return 'mult-orange'
  return 'mult-red'
}

export function getMultiplierAtTime(t: number, maxMultiplier: number): number {
  const progress = Math.min(t / 5, 1)
  return parseFloat(
    (1.0 + (maxMultiplier - 1.0) * Math.pow(progress, 1.8)).toFixed(2)
  )
}

// ── Server-only helpers ──────────────────────────────────────────────────────
// These use Node's crypto module. Only call them from API routes or
// server/socket.ts — never import into a client component directly.

function getCrypto() {
  // Dynamic require so Next.js doesn't bundle crypto into the client chunk.
  // On the server this always succeeds. On the client it will never be called
  // because none of the functions below are exported to client components.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('crypto') as typeof import('crypto')
}

export function generateRoundOutcome(
  serverSeed: string,
  clientSeed: string,
  roundId: string
): { color: Color; multiplier: number } {
  const crypto = getCrypto()
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
  return getCrypto().randomBytes(32).toString('hex')
}

export function generateClientSeed(): string {
  return getCrypto().randomBytes(16).toString('hex')
}

export function hashSeeds(serverSeed: string, clientSeed: string): string {
  const crypto = getCrypto()
  return crypto
    .createHmac('sha256', serverSeed)
    .update(clientSeed)
    .digest('hex')
}