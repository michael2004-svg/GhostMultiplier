// BROWSER SAFE — no Node.js dependencies

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
