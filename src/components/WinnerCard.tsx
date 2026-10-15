import { useEffect, useMemo, useState } from 'react'
import { NAMES } from '@/lib/draw'
import { FONT_MAIN, FONT_SERIF } from '@/lib/ui'
import { playClick, playReveal } from '@/lib/sound'

interface Props {
  round: number // 第几次抽（1/2/3）
  stopName: string // 转盘停下、卡片先展示的名字
  hint?: string // 彩蛋行：「离 xxx 最近的人」/「坐在 xxx 对面的人」
  disabled: string[] // 点选时不可选的名字
  onPick: (name: string) => void // 第 2、3 次：导演点选真正中奖人
  onClose: () => void
}

const ROUND_LABEL = ['', '第一次抽取', '第二次抽取', '第三次抽取', '第四次抽取']

type Phase = 'stop' | 'pick' | 'done'

export default function WinnerCard({ round, stopName, hint, disabled, onPick, onClose }: Props) {
  const hasPicker = round === 3 || round === 4
  const [phase, setPhase] = useState<Phase>(hasPicker ? 'stop' : 'done')
  const [winner, setWinner] = useState<string>(hasPicker ? '' : stopName)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(t)
  }, [])

  // 奶油滴落边（卡片顶部）
  const drips = useMemo(() => {
    const rand = (seed: number) => {
      let s = seed
      return () => {
        s = (s * 9301 + 49297) % 233280
        return s / 233280
      }
    }
    const r = rand(round * 99 + 7)
    return Array.from({ length: 12 }, (_, i) => ({
      left: i * 8.6 + r() * 2,
      len: 12 + r() * 22,
      w: 14 + r() * 12,
    }))
  }, [round])

  const handleCardClick = () => {
    if (phase === 'stop') {
      playReveal()
      setPhase('pick')
    }
  }

  const handlePick = (name: string) => {
    if (disabled.includes(name)) return
    playReveal()
    setWinner(name)
    setPhase('done')
    onPick(name)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-rose-950/25 backdrop-blur-[3px] transition-opacity duration-300 ${entered ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={handleCardClick}
        className={`relative mx-4 w-[min(92vw,400px)] select-none transition-all duration-500 ${
          entered ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        } ${phase === 'stop' ? 'cursor-pointer' : ''}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* 卡片主体 */}
        <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_25px_60px_rgba(230,105,150,0.35)] ring-1 ring-pink-100">
          {/* 顶部奶油层 */}
          <div className="relative bg-gradient-to-b from-[#f7b2cc] to-[#fbc9dc] pt-6 pb-2">
            <p className="text-center text-white/95 text-base font-semibold tracking-[0.4em]" style={{ textShadow: '0 1px 4px rgba(190,60,110,0.35)' }}>
              拉片大礼包
            </p>
            <div className="mx-auto mt-2 h-px w-24 bg-white/70" />
            {/* 奶油滴落 */}
            <div className="absolute top-full left-0 right-0 h-0">
              {drips.map((d, i) => (
                <div
                  key={i}
                  className="absolute bg-[#fbc9dc]"
                  style={{ left: `${d.left}%`, width: d.w, height: d.len, borderRadius: '0 0 999px 999px', top: -2 }}
                />
              ))}
            </div>
          </div>

          <div className="px-7 pt-10 pb-7 text-center" style={{ fontFamily: FONT_MAIN }}>
            <p className="text-xs font-semibold text-pink-400 tracking-[0.4em] mb-2">{ROUND_LABEL[round]}</p>

            {/* 停下的名字（始终展示） */}
            <p
              className={`font-bold my-2 ${phase === 'pick' ? 'text-3xl text-[#c98a9f]' : 'text-5xl text-[#c2447a]'}`}
              style={{ fontFamily: FONT_SERIF, letterSpacing: 6, textShadow: phase === 'pick' ? 'none' : '0 2px 0 #fbe4ee, 0 6px 14px rgba(230,120,160,0.3)' }}
            >
              {stopName}
            </p>

            {/* 阶段一：悬念提示 */}
            {phase === 'stop' && (
              <div className="mt-4 mb-5 flex flex-col items-center" style={{ animation: 'hint-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <p className="text-pink-400/80 text-sm mb-3">转盘停在了这里，但是……</p>
                <div className="animate-pulse rounded-full bg-pink-50 px-5 py-2 text-sm font-semibold text-pink-500 ring-1 ring-pink-200">
                  再点一下卡片，看看真正中奖的是谁
                </div>
              </div>
            )}

            {/* 阶段二：导演点选 */}
            {phase === 'pick' && (
              <div className="mt-3 mb-4" style={{ animation: 'hint-pop 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}>
                <div className="rounded-2xl bg-gradient-to-b from-[#fff5f9] to-[#ffeef5] px-4 py-4 ring-1 ring-pink-100">
                  <p className="text-xs font-semibold text-pink-400 tracking-[0.2em] mb-1">请导演亲自点选</p>
                  <p className="text-xl font-bold text-[#b03a6b] mb-3" style={{ fontFamily: FONT_SERIF, letterSpacing: 2 }}>
                    {hint} 」
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {NAMES.map((n) => {
                      const off = disabled.includes(n)
                      return (
                        <button
                          key={n}
                          disabled={off}
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePick(n)
                          }}
                          className={`rounded-full py-2 text-sm font-bold transition-all ${
                            off
                              ? 'cursor-not-allowed bg-gray-50 text-gray-300 ring-1 ring-gray-100'
                              : n === stopName
                                ? 'bg-pink-100 text-[#b03a6b] ring-1 ring-pink-300'
                                : 'bg-white text-[#b03a6b] ring-1 ring-pink-200 hover:bg-pink-50 hover:scale-105 active:scale-95 shadow-sm'
                          }`}
                        >
                          {n}
                        </button>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-pink-300">灰色为不可选（已中奖或规则排除）</p>
                </div>
              </div>
            )}

            {/* 阶段三：结果 */}
            {phase === 'done' && (
              <div className="mt-2 mb-5" style={{ animation: 'hint-pop 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
                {hasPicker ? (
                  <div className="rounded-2xl bg-gradient-to-b from-[#fff5f9] to-[#ffe9f2] px-5 py-4 ring-1 ring-pink-200">
                    <p className="text-xs font-semibold text-pink-400 tracking-[0.2em] mb-1">真正的幸运儿是</p>
                    <p className="text-base font-semibold text-[#c98a9f] mb-1">{hint}</p>
                    <p
                      className="text-4xl font-bold text-[#c2447a]"
                      style={{ fontFamily: FONT_SERIF, letterSpacing: 5, textShadow: '0 2px 0 #ffffff, 0 5px 12px rgba(230,120,160,0.35)' }}
                    >
                      {winner}
                    </p>
                  </div>
                ) : (
                  <p className="text-pink-400/90 text-sm">恭喜你成为下次拉片分享人！</p>
                )}
              </div>
            )}

            {phase === 'done' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  playClick()
                  onClose()
                }}
                className="rounded-full bg-gradient-to-r from-[#ef6fa3] to-[#f7a8c6] px-10 py-3 text-base font-bold text-white shadow-[0_8px_18px_rgba(230,110,150,0.4)] transition-transform hover:scale-105 active:scale-95"
                style={{ letterSpacing: 4 }}
              >
                收下啦
              </button>
            )}
          </div>
        </div>

        {/* 卡片四角装饰 */}
        <span className="absolute -left-2 -top-2 text-lg text-[#e9c9a0]" style={{ animation: 'twinkle 1.6s ease-in-out infinite' }}>✦</span>
        <span className="absolute -right-2 -top-1 text-sm text-[#e9c9a0]" style={{ animation: 'twinkle 1.6s ease-in-out 0.4s infinite' }}>✦</span>
        <span className="absolute -bottom-2 -left-1 text-sm text-[#e9c9a0]" style={{ animation: 'twinkle 1.6s ease-in-out 0.8s infinite' }}>✦</span>
        <span className="absolute -bottom-1 -right-2 text-lg text-[#e9c9a0]" style={{ animation: 'twinkle 1.6s ease-in-out 0.2s infinite' }}>✦</span>
      </div>
    </div>
  )
}
