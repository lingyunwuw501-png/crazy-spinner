import { useCallback, useEffect, useRef, useState } from 'react'
import CakeWheel from '@/components/CakeWheel'
import WinnerCard from '@/components/WinnerCard'
import Confetti from '@/components/Confetti'
import { NAMES, pickStop, disabledNames, type DrawResult } from '@/lib/draw'
import { playClick, playWin, startSpinTicks } from '@/lib/sound'
import { FONT_MAIN, FONT_SERIF } from '@/lib/ui'
import '../App.css'

const SPIN_MS = 5400
const TOTAL_ROUNDS = 4

// 背景柔光斑（替代卡通 emoji，保持优雅）
const BOKEH = [
  { left: '6%', top: '12%', size: 180, color: 'rgba(255,183,210,0.35)' },
  { left: '82%', top: '8%', size: 140, color: 'rgba(255,255,255,0.6)' },
  { left: '12%', top: '72%', size: 150, color: 'rgba(255,214,231,0.4)' },
  { left: '86%', top: '66%', size: 190, color: 'rgba(255,183,210,0.3)' },
  { left: '45%', top: '4%', size: 110, color: 'rgba(255,255,255,0.5)' },
  { left: '70%', top: '86%', size: 130, color: 'rgba(255,222,235,0.45)' },
]

export default function Home() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winners, setWinners] = useState<string[]>([]) // 真正的中奖者
  const [stops, setStops] = useState<string[]>([]) // 历次转盘停下的人名
  const [currentDraw, setCurrentDraw] = useState<DrawResult | null>(null)
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const timerRef = useRef<number | null>(null)
  const stopTicksRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      stopTicksRef.current?.()
    }
  }, [])

  const handleDraw = useCallback(() => {
    if (spinning || winners.length >= TOTAL_ROUNDS) return
    // 若上一次的第 2/3 次还没点选完，不允许继续
    if (currentDraw) return
    playClick()
    const round = winners.length + 1
    const draw = pickStop(round, winners, stops)

    // 让停下那一瓣的中心转到正上方指针处
    const sliceDeg = 360 / NAMES.length
    const sliceMid = draw.stopIndex * sliceDeg + sliceDeg / 2
    const targetMod = (360 - sliceMid) % 360
    const currentMod = ((rotation % 360) + 360) % 360
    const delta = (targetMod - currentMod + 360) % 360
    const nextRotation = rotation + 360 * 5 + delta

    setSpinning(true)
    setHighlightIndex(null)
    setRotation(nextRotation)
    stopTicksRef.current = startSpinTicks(SPIN_MS)

    timerRef.current = window.setTimeout(() => {
      setSpinning(false)
      setStops((s) => [...s, draw.stopName])
      setCurrentDraw(draw)
      setHighlightIndex(draw.stopIndex)
      setBurstKey((k) => k + 1)
      playWin()
      // 第 1、2 次：停下的人直接中奖
      if (round <= 2) {
        setWinners((w) => [...w, draw.stopName])
      }
    }, SPIN_MS)
  }, [spinning, winners, stops, rotation, currentDraw])

  const handlePick = useCallback((name: string) => {
    setWinners((w) => [...w, name])
  }, [])

  const handleReset = useCallback(() => {
    playClick()
    setWinners([])
    setStops([])
    setCurrentDraw(null)
    setHighlightIndex(null)
  }, [])

  const done = winners.length >= TOTAL_ROUNDS

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fff7fa] via-[#fdeef4] to-[#fbe3ec]" style={{ fontFamily: FONT_MAIN }}>
      {/* 柔光斑背景 */}
      {BOKEH.map((b, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full blur-2xl"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: b.color,
            animation: `floaty ${6 + (i % 3)}s ease-in-out ${i * 0.8}s infinite`,
          }}
        />
      ))}

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center px-4 py-10">
        {/* 标题 */}
        <header className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold tracking-[0.6em] text-pink-400/90">
            导演拉片分享 · 幸运抽奖
          </p>
          <div className="mx-auto mb-3 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#e9c9a0]" />
            <span className="text-[#d9a86c] text-xs">✦</span>
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#e9c9a0]" />
          </div>
          <h1
            className="text-6xl md:text-7xl font-bold"
            style={{
              fontFamily: FONT_SERIF,
              background: 'linear-gradient(180deg,#9c2a5c 5%,#c2447a 45%,#dd6d9e 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 3px 5px rgba(156,42,92,0.28))',
              letterSpacing: 8,
            }}
          >
            疯狂转转转
          </h1>
          <p className="mt-4 text-sm font-medium text-pink-400/90" style={{ letterSpacing: 4 }}>
            转一转蛋糕，抽出下次的拉片分享人
          </p>
        </header>

        {/* 蛋糕转盘 */}
        <CakeWheel rotation={rotation} spinning={spinning} highlightIndex={highlightIndex} />

        {/* 抽奖按钮 */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {!done ? (
            <button
              onClick={handleDraw}
              disabled={spinning || !!currentDraw}
              className={`relative rounded-full px-12 py-4 text-xl font-bold text-white transition-all ${
                spinning || currentDraw
                  ? 'cursor-wait bg-pink-300/80'
                  : 'bg-gradient-to-r from-[#e5609a] via-[#ee87b2] to-[#f5abc8] shadow-[0_10px_26px_rgba(225,96,154,0.4)] hover:scale-105 hover:shadow-[0_14px_32px_rgba(225,96,154,0.5)] active:scale-95'
              }`}
              style={{ letterSpacing: 5 }}
            >
              {spinning ? '转动中…' : currentDraw ? '请先完成点选' : '领取拉片大礼包'}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-lg font-bold text-[#b03a6b]" style={{ fontFamily: FONT_SERIF, letterSpacing: 3 }}>
                四位幸运儿已全部诞生
              </p>
              <button
                onClick={handleReset}
                className="rounded-full bg-white px-10 py-3 text-base font-bold text-[#d6568e] shadow-[0_6px_16px_rgba(225,110,150,0.25)] ring-1 ring-pink-200 transition-transform hover:scale-105 active:scale-95"
                style={{ letterSpacing: 4 }}
              >
                重新开始
              </button>
            </div>
          )}

          {/* 进度小圆点 */}
          <div className="flex items-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  winners[i]
                    ? 'bg-gradient-to-br from-[#e5609a] to-[#f0a0c0] text-white shadow-md'
                    : 'bg-white/80 text-pink-300 ring-1 ring-pink-200'
                }`}
              >
                {winners[i] ? '✓' : i + 1}
              </div>
            ))}
          </div>

          {/* 已中奖名单 */}
          {winners.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              {winners.map((w, i) => (
                <span
                  key={`${w}-${i}`}
                  className="rounded-full bg-white/90 px-5 py-2 font-bold text-[#b03a6b] shadow-[0_4px_12px_rgba(225,110,150,0.2)] ring-1 ring-pink-100"
                  style={{ letterSpacing: 2, animation: 'hint-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
                >
                  {['①', '②', '③', '④'][i]} {w}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 中奖卡片 / 点选弹窗 */}
      {currentDraw && (
        <WinnerCard
          round={currentDraw.round}
          stopName={currentDraw.stopName}
          hint={currentDraw.hint}
          disabled={disabledNames(currentDraw.stopName, winners)}
          onPick={handlePick}
          onClose={() => setCurrentDraw(null)}
        />
      )}

      {/* 纸屑 */}
      {burstKey > 0 && <Confetti burstKey={burstKey} />}
    </div>
  )
}
