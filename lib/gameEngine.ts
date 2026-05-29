import type { Phase } from '@/types/game'

export const PHASE_DURATIONS: Record<Phase, number> = {
  IDLE: 0,
  BETTING: 2000,
  MULTIPLIER: 5000,
  LOCK: 1000,
  FLIP: 2000,
  RESOLUTION: 3000,
}

export const PHASE_SEQUENCE: Phase[] = [
  'BETTING',
  'MULTIPLIER',
  'LOCK',
  'FLIP',
  'RESOLUTION',
]

export function getNextPhase(current: Phase): Phase {
  const idx = PHASE_SEQUENCE.indexOf(current)
  if (idx === -1 || idx === PHASE_SEQUENCE.length - 1) return 'BETTING'
  return PHASE_SEQUENCE[idx + 1]
}

export function getPhaseDuration(phase: Phase): number {
  return PHASE_DURATIONS[phase] ?? 0
}

export function formatMultiplier(value: number): string {
  return `${value.toFixed(2)}x`
}

export function formatKES(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M KES`
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K KES`
  return `${amount.toLocaleString()} KES`
}

export function getVIPXPThreshold(level: string): { min: number; max: number } {
  const thresholds: Record<string, { min: number; max: number }> = {
    Bronze: { min: 0, max: 4999 },
    Silver: { min: 5000, max: 19999 },
    Gold: { min: 20000, max: 49999 },
    Platinum: { min: 50000, max: 99999 },
    Diamond: { min: 100000, max: Infinity },
  }
  return thresholds[level] ?? thresholds.Bronze
}

export function getVIPProgress(xp: number, level: string): number {
  const { min, max } = getVIPXPThreshold(level)
  if (max === Infinity) return 100
  return Math.min(100, ((xp - min) / (max - min)) * 100)
}

export function getNextVIPLevel(level: string): string | null {
  const order = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  const idx = order.indexOf(level)
  return idx === order.length - 1 ? null : order[idx + 1]
}