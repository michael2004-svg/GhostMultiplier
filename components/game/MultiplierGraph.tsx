'use client'
import { useGameStore } from '@/store/gameStore'
import { useMemo } from 'react'

const W = 400
const H = 180
const PAD = { top: 16, right: 16, bottom: 28, left: 16 }

export default function MultiplierGraph() {
  const history = useGameStore((s) => s.multiplierHistory)
  const phase = useGameStore((s) => s.phase)

  const { path, fill, dotX, dotY, strokeColor } = useMemo(() => {
    if (history.length < 2) return { path: '', fill: '', dotX: 0, dotY: 0, strokeColor: '#ffffff' }

    const maxT = 5
    const maxV = Math.max(...history.map((p) => p.v), 2)
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    const scaleX = (t: number) => PAD.left + (t / maxT) * innerW
    const scaleY = (v: number) => H - PAD.bottom - ((v - 1) / (maxV - 1 || 1)) * innerH

    let d = `M ${scaleX(history[0].t)} ${scaleY(history[0].v)}`
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1]
      const curr = history[i]
      const cpx = (scaleX(prev.t) + scaleX(curr.t)) / 2
      d += ` C ${cpx} ${scaleY(prev.v)}, ${cpx} ${scaleY(curr.v)}, ${scaleX(curr.t)} ${scaleY(curr.v)}`
    }

    const last = history[history.length - 1]
    const fillPath =
      d +
      ` L ${scaleX(last.t)} ${H - PAD.bottom}` +
      ` L ${scaleX(history[0].t)} ${H - PAD.bottom} Z`

    const cv = last.v
    const color =
      cv < 1.5 ? '#e2e8f0' :
      cv < 2.0 ? '#F59E0B' :
      cv < 2.5 ? '#F97316' : '#EF4444'

    return {
      path: d,
      fill: fillPath,
      dotX: scaleX(last.t),
      dotY: scaleY(last.v),
      strokeColor: color,
    }
  }, [history])

  if (phase === 'WAITING' || history.length < 2) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-gray-700 text-sm">Waiting for round...</div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1 h-8 bg-white/5 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
          <filter id="lineglow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="dotglow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid */}
        {[0, 0.5, 1].map((frac, i) => (
          <line
            key={i}
            x1={PAD.left}
            y1={PAD.top + frac * (H - PAD.top - PAD.bottom)}
            x2={W - PAD.right}
            y2={PAD.top + frac * (H - PAD.top - PAD.bottom)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}

        {/* Fill */}
        <path d={fill} fill="url(#graphGrad)" />

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineglow)"
          style={{ transition: 'd 0.08s linear' }}
        />

        {/* Trailing dot */}
        <circle cx={dotX} cy={dotY} r="5" fill={strokeColor} filter="url(#dotglow)">
          <animate attributeName="r" values="4;8;4" dur="0.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="0.7s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  )
}