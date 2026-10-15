// 音效：WebAudio 合成，无需外部音频文件
let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const c = ac()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + start
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

/** 按钮点击：轻快的啵声 */
export function playClick() {
  tone(520, 0, 0.09, 'sine', 0.25)
  tone(780, 0.05, 0.1, 'sine', 0.2)
}

/** 转盘滴答声（单次） */
export function playTick() {
  tone(1400, 0, 0.045, 'square', 0.06)
}

/** 转动期间由密到疏的滴答声，返回停止函数 */
export function startSpinTicks(durationMs: number): () => void {
  let stopped = false
  let elapsed = 0
  let interval = 70
  let timer = 0
  const step = () => {
    if (stopped) return
    playTick()
    elapsed += interval
    // 越转越慢：间隔随时间二次增长
    interval = 70 + 320 * Math.pow(elapsed / durationMs, 2)
    if (elapsed < durationMs - 200) {
      timer = window.setTimeout(step, interval)
    }
  }
  timer = window.setTimeout(step, 0)
  return () => {
    stopped = true
    window.clearTimeout(timer)
  }
}

/** 中奖：欢快的号角上扬琶音 */
export function playWin() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((f, i) => tone(f, i * 0.13, 0.35, 'triangle', 0.3))
  tone(1318.5, 0.55, 0.6, 'triangle', 0.28) // E6 收尾
  tone(659.25, 0.55, 0.6, 'sine', 0.15)
}

/** 彩蛋揭晓：魔法叮当 */
export function playReveal() {
  tone(1567.98, 0, 0.5, 'sine', 0.22) // G6
  tone(2093, 0.12, 0.6, 'sine', 0.18) // C7
  tone(2637, 0.24, 0.7, 'sine', 0.12) // E7
}
