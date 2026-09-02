import type { StudySessionLog } from '../types'

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/**
 * Counts consecutive days (ending today, or yesterday if today has no
 * session yet) on which at least one study session was finished.
 */
export function computeStreak(sessions: StudySessionLog[]): number {
  if (sessions.length === 0) return 0

  const days = new Set(
    sessions.map((s) => dayKey(new Date(s.created_at))),
  )

  const cursor = new Date()
  // A streak is still alive if you studied yesterday but not yet today.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayKey(cursor))) return 0
  }

  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function studiedToday(sessions: StudySessionLog[]): boolean {
  const today = dayKey(new Date())
  return sessions.some((s) => dayKey(new Date(s.created_at)) === today)
}
