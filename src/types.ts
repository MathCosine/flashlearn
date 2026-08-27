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
  created_at: string
}

export interface CardProgress {
  id: string
  user_id: string
  card_id: string
  dots: number
  known: boolean
  last_reviewed: string | null
}

export type StudyMode =
  | 'flip'
  | 'stack'
  | 'dots'
  | 'speed'
  | 'choice'
  | 'type'

export interface StudyModeMeta {
  id: StudyMode
  name: string
  blurb: string
  emoji: string
}

export const STUDY_MODES: StudyModeMeta[] = [
  {
    id: 'flip',
    name: 'Classic Flip',
    blurb: 'Look at the front, try to recall the back, then flip to check.',
    emoji: '🔄',
  },
  {
    id: 'stack',
    name: 'Stack Method',
    blurb:
      'Sort cards into "known" and "not yet" piles, then repeat with just the not-yet pile.',
    emoji: '🗂️',
  },
  {
    id: 'dots',
    name: 'Dot Method',
    blurb:
      'Cards you miss get a dot. Dots build up over time on stubborn cards so you know what to focus on.',
    emoji: '🔴',
  },
  {
    id: 'speed',
    name: 'Speed Round',
    blurb: 'A short timed sprint through shuffled cards — great for a quick daily review.',
    emoji: '⏱️',
  },
  {
    id: 'choice',
    name: 'Multiple Choice',
    blurb: 'Pick the right answer from 4 options.',
    emoji: '✅',
  },
  {
    id: 'type',
    name: 'Type the Answer',
    blurb: 'Type the answer from memory. Case, spacing, and accents are forgiving by default.',
    emoji: '⌨️',
  },
]
