import { useMemo } from 'react'
import { NAMES } from '@/lib/draw'
import { FONT_MAIN } from '@/lib/ui'

const CX = 300
const CY = 300
const R = 262 // 蛋糕半径
const SLICE = 360 / NAMES.length // 每瓣角度

// 粉白渐变的蛋糕瓣（低饱和、优雅）
const SLICE_COLORS = ['#ffe4ee', '#fff7fa', '#ffd8e6', '#fdf0f5']

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function wedgePath(startAngle: number, endAngle: number, radius: number) {
  const s = polar(startAngle, radius)
  const e = polar(endAngle, radius)
  return `M ${CX} ${CY} L ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)} Z`
}

interface Props {
  rotation: number // 当前旋转角度（度）
  spinning: boolean
  highlightIndex: number | null // 停下后高亮的瓣
}

export default function CakeWheel({ rotation, spinning, highlightIndex }: Props) {
  // 奶油裱花外圈（珍珠圆球）
  const creamBalls = useMemo(() => {
    const n = 28
    return Array.from({ length: n }, (_, i) => polar((i * 360) / n, R + 5))
  }, [])

  // 每瓣的珍珠点缀
  const pearls = useMemo(() => {
    return NAMES.flatMap((_, i) => {
      return [-6, 6].map((off, j) => {
        const p = polar(i * SLICE + SLICE / 2 + off, 96)
        return { ...p, key: `${i}-${j}` }
      })
    })
  }, [])

  return (
    <div className="relative" style={{ width: 'min(82vw, 600px)', aspectRatio: '1' }}>
      {/* 底层光晕 */}
      <div className="absolute inset-[-8%] rounded-full bg-pink-300/30 blur-3xl" />

      {/* 转盘本体（旋转部分） */}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? 'transform 5.2s cubic-bezier(0.12, 0.8, 0.08, 1)'
            : 'transform 0.6s ease',
        }}
      >
        <svg viewBox="0 0 600 600" className="w-full h-full drop-shadow-[0_22px_40px_rgba(230,120,160,0.28)]">
          <defs>
            <radialGradient id="hubGrad" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#ffeaf2" />
              <stop offset="100%" stopColor="#f7b9d0" />
            </radialGradient>
          </defs>

          {/* 蛋糕底盘阴影与托边 */}
          <circle cx={CX} cy={CY + 10} r={R + 14} fill="#eec3d4" opacity="0.55" />
          <circle cx={CX} cy={CY} r={R + 12} fill="#fffdfd" />
          <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="#e8b9cd" strokeWidth="1.5" />

          {/* 蛋糕瓣 */}
          {NAMES.map((name, i) => {
            const start = i * SLICE
            const mid = start + SLICE / 2
            const highlighted = highlightIndex === i
            const flip = mid > 90 && mid < 270
            // 竖排人名：第一个字在最外侧；下半圆翻转时倒序排列，保证阅读顺序
            const chars = flip ? [...name].reverse() : [...name]
            const lineH = 40
            const centerR = 172
            return (
              <g key={name}>
                <path
                  d={wedgePath(start + 0.5, start + SLICE - 0.5, R)}
                  fill={highlighted ? '#f9c3d9' : SLICE_COLORS[i % SLICE_COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  style={highlighted ? { filter: 'drop-shadow(0 0 12px rgba(224,82,141,0.7))' } : undefined}
                />
                {/* 竖排人名 */}
                <g transform={`rotate(${mid} ${CX} ${CY})`}>
                  {chars.map((ch, ci) => {
                    const rho = centerR + ((chars.length - 1) / 2 - ci) * lineH
                    const y = CY - rho
                    return (
                      <text
                        key={ci}
                        x={CX}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="37"
                        fontWeight="700"
                        fill={highlighted ? '#d63d7a' : '#a13a63'}
                        stroke="#ffffff"
                        strokeWidth="6"
                        paintOrder="stroke"
                        style={{ fontFamily: FONT_MAIN }}
                        transform={flip ? `rotate(180 ${CX} ${y})` : undefined}
                      >
                        {ch}
                      </text>
                    )
                  })}
                </g>
              </g>
            )
          })}

          {/* 珍珠点缀 */}
          {pearls.map((p) => (
            <circle key={p.key} cx={p.x} cy={p.y} r="4" fill="#ffffff" opacity="0.85" />
          ))}

          {/* 装饰金线圆环 */}
          <circle cx={CX} cy={CY} r="238" fill="none" stroke="#e9c9a0" strokeWidth="1.6" opacity="0.9" />
          <circle cx={CX} cy={CY} r="70" fill="none" stroke="#e9c9a0" strokeWidth="1.6" opacity="0.9" />

          {/* 奶油裱花外圈（珍珠） */}
          {creamBalls.map((b, i) => (
            <g key={i}>
              <circle cx={b.x} cy={b.y} r="11" fill="#fffdfa" />
              <circle cx={b.x - 2.5} cy={b.y - 2.5} r="4" fill="#ffffff" opacity="0.95" />
              <circle cx={b.x} cy={b.y} r="11" fill="none" stroke="#efd9e4" strokeWidth="1" />
            </g>
          ))}

          {/* 中心奶油花 */}
          <circle cx={CX} cy={CY} r="58" fill="#fffdfa" stroke="#eecfe0" strokeWidth="3" />
          {Array.from({ length: 8 }, (_, i) => {
            const p = polar(i * 45 + 22, 34)
            return <circle key={i} cx={p.x} cy={p.y} r="12" fill="#ffe9f1" />
          })}
          <circle cx={CX} cy={CY} r="24" fill="url(#hubGrad)" stroke="#ffffff" strokeWidth="2.5" />
          <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fontSize="18" fill="#c98a4b">
            ✦
          </text>
        </svg>
      </div>

      {/* 顶部指针（不旋转）：玫瑰金细针 + 珍珠 */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{
          top: '-2.5%',
          animation: spinning ? 'pointer-wiggle 0.35s ease-in-out infinite' : undefined,
        }}
      >
        <svg width="60" height="88" viewBox="0 0 60 88" className="drop-shadow-[0_6px_12px_rgba(220,90,140,0.45)]">
          <path d="M30 86 L14 34 Q30 24 46 34 Z" fill="#e0528d" stroke="#f2d8b3" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="30" cy="16" r="11" fill="#fffdfa" stroke="#e0528d" strokeWidth="2.5" />
          <circle cx="26.5" cy="12.5" r="3.5" fill="#ffffff" />
        </svg>
      </div>
    </div>
  )
}
