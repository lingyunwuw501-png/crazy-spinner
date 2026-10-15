import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#ef8fb8', '#f9d3e2', '#ffffff', '#e9c9a0', '#f5b8cf']
const SHAPES = ['●', '■', '✦']

interface Piece {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  color: string
  shape: string
  drift: number
}

export default function Confetti({ burstKey }: { burstKey: number }) {
  const [visible, setVisible] = useState(false)

  const pieces = useMemo<Piece[]>(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.4 + Math.random() * 1.6,
      size: 10 + Math.random() * 14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      drift: -60 + Math.random() * 120,
    }))
  }, [burstKey])

  useEffect(() => {
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(t)
  }, [burstKey])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            color: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            ['--drift' as string]: `${p.drift}px`,
            textShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}
        >
          {p.shape}
        </span>
      ))}
    </div>
  )
}
