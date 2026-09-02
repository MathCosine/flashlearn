/** Personal best Match Game times, kept per set signature in the browser. */

const KEY = 'flashlearn:bestTimes'

type BestTimes = Record<string, number>

function read(): BestTimes {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as BestTimes
  } catch {
    return {}
  }
}

export function getBestTime(signature: string): number | null {
  return read()[signature] ?? null
}

/** Saves `seconds` if it beats the stored best. Returns true if it did. */
export function saveBestTime(signature: string, seconds: number): boolean {
  const all = read()
  const previous = all[signature]
  if (previous !== undefined && previous <= seconds) return false
  all[signature] = seconds
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch {
    return false
  }
  return previous !== undefined
}

export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
