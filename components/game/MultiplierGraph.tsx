'use client'
import { useGameStore } from '@/store/gameStore'
import { useMemo } from 'react'

const W = 400
const H = 200
const PAD = { top: 20, right: 10, bottom: 30, left: 10 }

export default function MultiplierGraph() {
  const history = useGameStore((s) => s.multiplierHistory)
  const phase = useGameStore((s) => s.phase)

  const { path, fill } = useMemo(() => {
    if (history.length < 2) return { path: '', fill: '' }
    const maxT = 5
    const maxV = Math.max(...history.map((p) => p.v), 2)
    const scaleX = (t: number) => PAD.left + (t / maxT) * (W - PAD.left - PAD.right)
    const scaleY = (v: number) => H - PAD.bottom - ((v - 1) / (maxV - 1 || 1)) * (H - PAD.top - PAD.bottom)

    let d = `M ${scaleX(history[0].t)} ${scaleY(history[0].v)}`
    for (let i = 1; i < history.length; i++) {
      d += ` L ${scaleX(history[i].t)} ${scaleY(history[i].v)}`
    }
    const last = history[history.length - 1]
    const fillPath = d + ` L ${scaleX(last.t)} ${H - PAD.bottom} L ${scaleX(history[0].t)} ${H - PAD.bottom} Z`
    return { path: d, fill: fillPath }
  }, [history])

  return (
    <div className="w-full relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C0392B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C0392B" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[2, 3, 4, 5, 6, 7].map((t) => (
          <g key={t}>
            <line
              x1={PAD.left + ((t - 2) / 5) * (W - PAD.left - PAD.right)}
              y1={PAD.top}
              x2={PAD.left + ((t - 2) / 5) * (W - PAD.left - PAD.right)}
              y2={H - PAD.bottom}
              stroke="#ffffff0d"
              strokeWidth="1"
            />
            <text
              x={PAD.left + ((t - 2) / 5) * (W - PAD.left - PAD.right)}
              y={H - 8}
              fill="#555"
              fontSize="10"
              textAnchor="middle"
            >
              {t}s
            </text>
          </g>
        ))}
        {/* Fill */}
        {fill && <path d={fill} className="graph-fill" />}
        {/* Line */}
        {path && <path d={path} className="graph-line" strokeLinecap="round" strokeLinejoin="round" />}
        {/* Dot at current position */}
        {history.length > 0 && (() => {
          const last = history[history.length - 1]
          const maxT = 5
          const maxV = Math.max(...history.map((p) => p.v), 2)
          const x = PAD.left + (last.t / maxT) * (W - PAD.left - PAD.right)
          const y = H - PAD.bottom - ((last.v - 1) / (maxV - 1 || 1)) * (H - PAD.top - PAD.bottom)
          return (
            <circle cx={x} cy={y} r="5" fill="#C0392B" filter="url(#glow)">
              <animate attributeName="r" values="5;8;5" dur="0.5s" repeatCount="indefinite" />
            </circle>
          )
        })()}
      </svg>
    </div>
  )
}