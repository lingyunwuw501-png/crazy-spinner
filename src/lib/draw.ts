// 抽奖人员名单与规则
export const NAMES = [
  '张德宁', '雷庆', '李彤', '周晗', '李一笑',
  '胡旆娴', '姚丁壹', '裴星晨', '徐宋雨', '张雨彤',
  '林琦', '钟峥诚', '万恩典', '鲁欣悦',
]

// 第 2、3 次抽奖不能涉及的人
export const EXCLUDED_AFTER_FIRST = '钟峥诚'

export interface DrawResult {
  round: number
  /** 转盘停下的那一瓣（卡片上先展示的名字） */
  stopIndex: number
  stopName: string
  /** 彩蛋行文案（仅第 2、3 次有） */
  hint?: string
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 抽取第 round（1/2/3/4）次转盘停下的位置。
 * - 第 1、2 次：全员等概率，停下的人即为中奖者（抽到谁就是谁）
 * - 第 3 次：停下的人为「导演」，中奖者由导演在弹窗中点选「离 TA 最近的人」
 * - 第 4 次：停下的人为「导演」，中奖者由导演点选「坐在 TA 对面的人」
 * - 第 3、4 次停下的人不能是 EXCLUDED_AFTER_FIRST，也不能已中过奖
 */
export function pickStop(round: number, prevWinners: string[], prevStops: string[]): DrawResult {
  const pool = NAMES.filter((x) => !prevWinners.includes(x) && !prevStops.includes(x))
  const eligible = round <= 2 ? pool : pool.filter((x) => x !== EXCLUDED_AFTER_FIRST)
  const stopName = rand(eligible)
  const stopIndex = NAMES.indexOf(stopName)

  if (round === 3) {
    return { round, stopIndex, stopName, hint: `离 ${stopName} 最近的人` }
  }
  if (round === 4) {
    return { round, stopIndex, stopName, hint: `坐在 ${stopName} 对面的人` }
  }
  return { round, stopIndex, stopName }
}

/** 第 3、4 次点选弹窗中不可选的名字 */
export function disabledNames(stopName: string, prevWinners: string[]): string[] {
  return [...new Set([...prevWinners, stopName, EXCLUDED_AFTER_FIRST])]
}
