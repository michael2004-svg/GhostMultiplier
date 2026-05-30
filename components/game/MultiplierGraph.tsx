'use client'
import { useGameStore } from '@/store/gameStore'
import { getMultiplierColor } from '@/lib/multiplierUtils'
import { useMemo } from 'react'

const W = 400
const H = 200
const PAD = { top: 20, right: 10, bottom: 30, left: 10 }

export default function MultiplierGraph() {
  const history = useGameStore((s) => s.multiplierHistory)

  const { path, fill, dotX, dotY } = useMemo(() => {
    if (history.length < 2) return { path: '', fill: '', dotX: 0, dotY: 0 }

    const maxT = 5
    const maxV = Math.max(...history.map((p) => p.v), 2)
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    const scaleX = (t: number) => PAD.left + (t / maxT) * innerW
    const scaleY = (v: number) => H - PAD.bottom - ((v - 1) / (maxV - 1 || 1)) * innerH

    let d = `M ${scaleX(history[0].t)} ${scaleY(history[0].v)}`
    for (let i = 1; i < history.length; i++) {
      d += ` L ${scaleX(history[i].t)} ${scaleY(history[i].v)}`
    }

    const last = history[history.length - 1]
    const fillPath =
      d +
      ` L ${scaleX(last.t)} ${H - PAD.bottom}` +
      ` L ${scaleX(history[0].t)} ${H - PAD.bottom} Z`

    return {
      path: d,
      fill: fillPath,
      dotX: scaleX(last.t),
      dotY: scaleY(last.v),
    }
  }, [history])

  const currentMult = history.length > 0 ? history[history.length - 1].v : 1
  const strokeColor =
    currentMult < 1.5 ? '#ffffff' :
    currentMult < 2.0 ? '#F39C12' :
    currentMult < 2.5 ? '#E67E22' : '#E74C3C'

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[H - PAD.bottom, H - PAD.bottom - (H - PAD.top - PAD.bottom) / 2, PAD.top].map((y, i) => (
          <line
            key={i}
            x1={PAD.left} y1={y}
            x2={W - PAD.right} y2={y}
            stroke="#ffffff08"
            strokeWidth="1"
          />
        ))}

        {/* Fill area */}
        {fill && (
          <path d={fill} fill="url(#graphGradient)" />
        )}

        {/* Line */}
        {path && (
          <path
            d={path}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        )}

        {/* Dot at current position */}
        {history.length > 1 && (
          <circle cx={dotX} cy={dotY} r="5" fill={strokeColor} filter="url(#glow)">
            <animate attributeName="r" values="4;7;4" dur="0.6s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Empty state label */}
        {history.length < 2 && (
          <text
            x={W / 2} y={H / 2}
            fill="#333"
            fontSize="14"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            Waiting for round...
          </text>
        )}
      </svg>
    </div>
  )
}