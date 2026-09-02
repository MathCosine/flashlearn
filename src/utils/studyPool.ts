import type {
  CardProgress,
  FlashCard,
  StudyItem,
  StudyOptions,
} from '../types'
import { shuffle } from './shuffle'

function passesFilter(
  options: StudyOptions,
  progress: CardProgress | undefined,
): boolean {
  switch (options.pool) {
    case 'unknown':
      return !progress?.known
    case 'starred':
      return Boolean(progress?.starred)
    case 'stubborn':
      return (progress?.dots ?? 0) >= 3
    case 'all':
    default:
      return true
  }
}

/**
 * Turns the raw cards of the selected sets into the ordered list a study
 * mode works through, applying the session's filter, shuffle, limit and
 * prompt direction.
 */
export function buildStudyItems(
  cards: FlashCard[],
  options: StudyOptions,
  progressByCard: Record<string, CardProgress>,
): StudyItem[] {
  const filtered = cards.filter((c) =>
    passesFilter(options, progressByCard[c.id]),
  )

  const ordered = options.shuffle ? shuffle(filtered) : filtered
  const limited =
    options.limit > 0 ? ordered.slice(0, options.limit) : ordered

  return limited.map((card, i) => {
    const reversed =
      options.direction === 'back' ||
      (options.direction === 'mixed' && i % 2 === 1)

    return {
      card,
      prompt: reversed ? card.back : card.front,
      answer: reversed ? card.front : card.back,
      reversed,
    }
  })
}
