export interface ExtraFieldDef {
  key: string
  label: string
}

export interface FlashSet {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string | null
  tags: string[]
  extra_fields: ExtraFieldDef[]
  strict_answers: boolean
  created_at: string
}

export interface FlashCard {
  id: string
  set_id: string
  user_id: string
  front: string
  back: string
  extra_data: Record<string, string>
  image_url: string | null
  created_at: string
}

export interface CardProgress {
  id: string
  user_id: string
  card_id: string
  dots: number
  known: boolean
  starred: boolean
  times_seen: number
  times_correct: number
  last_reviewed: string | null
}

export interface StudySessionLog {
  id: string
  user_id: string
  mode: string
  cards_studied: number
  cards_correct: number
  created_at: string
}

export type StudyMode =
  | 'flip'
  | 'stack'
  | 'dots'
  | 'speed'
  | 'choice'
  | 'type'
  | 'match'
  | 'truefalse'
  | 'learn'

/** Which side of the card is shown as the prompt. */
export type Direction = 'front' | 'back' | 'mixed'

/** Which subset of the selected sets' cards to study. */
export type PoolFilter = 'all' | 'unknown' | 'starred' | 'stubborn'

export interface StudyOptions {
  direction: Direction
  pool: PoolFilter
  shuffle: boolean
  limit: number // 0 = no limit
}

export const DEFAULT_STUDY_OPTIONS: StudyOptions = {
  direction: 'front',
  pool: 'all',
  shuffle: true,
  limit: 0,
}

/**
 * A card resolved for a study session: `prompt` is what the learner sees
 * first and `answer` is what they're trying to recall, already accounting
 * for the session's direction setting.
 */
export interface StudyItem {
  card: FlashCard
  prompt: string
  answer: string
  reversed: boolean
}

export interface SessionResult {
  studied: number
  correct: number
}

/** How a mode reports an answer back so progress can be saved centrally. */
export interface RecordOptions {
  correct?: boolean
  addDot?: boolean
  starred?: boolean
}

export interface StudyModeProps {
  items: StudyItem[]
  setById: Map<string, FlashSet>
  progressByCard: Record<string, CardProgress>
  record: (cardId: string, opts: RecordOptions) => void
  onFinish: (result: SessionResult) => void
}

export interface StudyModeMeta {
  id: StudyMode
  name: string
  blurb: string
  /** Tailwind classes for the mode's tile in the picker. */
  color: string
  /** Modes that are games rather than plain review. */
  playful?: boolean
}

export const STUDY_MODES: StudyModeMeta[] = [
  {
    id: 'flip',
    name: 'Classic Flip',
    blurb: 'See the prompt, recall the answer, flip to check yourself.',
    color: 'bg-amber-200',
  },
  {
    id: 'stack',
    name: 'Stack Method',
    blurb:
      'Sort cards into "known" and "not yet" piles, then repeat the not-yet pile until it is empty.',
    color: 'bg-sky-200',
  },
  {
    id: 'dots',
    name: 'Dot Method',
    blurb:
      'Miss a card and it earns a dot. Dots pile up on stubborn cards so you know what needs work.',
    color: 'bg-rose-200',
  },
  {
    id: 'learn',
    name: 'Learn',
    blurb:
      'Adaptive rounds that start with multiple choice and graduate to typing once a card sticks.',
    color: 'bg-violet-200',
  },
  {
    id: 'speed',
    name: 'Speed Round',
    blurb: 'A timed sprint through shuffled cards. Perfect for a five minute daily review.',
    color: 'bg-lime-200',
    playful: true,
  },
  {
    id: 'match',
    name: 'Match Game',
    blurb: 'Race the clock pairing prompts with answers on a grid. Beat your best time.',
    color: 'bg-fuchsia-200',
    playful: true,
  },
  {
    id: 'truefalse',
    name: 'True or False',
    blurb: 'Rapid fire. Decide whether the pairing on screen is right or wrong.',
    color: 'bg-orange-200',
    playful: true,
  },
  {
    id: 'choice',
    name: 'Multiple Choice',
    blurb: 'Pick the right answer from a handful of options drawn from your own cards.',
    color: 'bg-emerald-200',
  },
  {
    id: 'type',
    name: 'Type the Answer',
    blurb: 'Type it from memory. Case, spacing and accents are forgiving unless you turn that off.',
    color: 'bg-cyan-200',
  },
]

export function studyModeById(id: string): StudyModeMeta | undefined {
  return STUDY_MODES.find((m) => m.id === id)
}
