import type { ExtraFieldDef } from '../types'

export interface ParsedRow {
  front: string
  back: string
  extra_data: Record<string, string>
}

export type Delimiter = 'auto' | 'tab' | 'comma' | 'pipe' | 'dash' | 'colon'

const PATTERNS: Record<Exclude<Delimiter, 'auto'>, RegExp> = {
  tab: /\t/,
  pipe: /\s*\|\s*/,
  // A dash used as a separator, not a hyphen inside a word.
  dash: /\s+[-–—]\s+/,
  comma: /\s*,\s*/,
  colon: /\s*:\s*/,
}

export const DELIMITER_LABELS: Record<Delimiter, string> = {
  auto: 'Detect automatically',
  tab: 'Tab (pasted from a spreadsheet)',
  pipe: 'Pipe  |',
  dash: 'Dash  -',
  comma: 'Comma  ,',
  colon: 'Colon  :',
}

/**
 * Guesses the separator by seeing which one splits the most lines into at
 * least two parts, preferring unambiguous separators over commas (which
 * often appear inside a definition).
 */
export function detectDelimiter(text: string): Exclude<Delimiter, 'auto'> {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return 'tab'

  const order: Exclude<Delimiter, 'auto'>[] = [
    'tab',
    'pipe',
    'dash',
    'colon',
    'comma',
  ]

  let best: Exclude<Delimiter, 'auto'> = 'tab'
  let bestScore = 0
  for (const candidate of order) {
    const score = lines.filter(
      (line) => line.split(PATTERNS[candidate]).length >= 2,
    ).length
    // Strictly greater keeps the earlier (less ambiguous) candidate on ties.
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }
  return best
}

export function parseImport(
  text: string,
  delimiter: Delimiter,
  extraFields: ExtraFieldDef[],
): ParsedRow[] {
  const resolved = delimiter === 'auto' ? detectDelimiter(text) : delimiter
  const pattern = PATTERNS[resolved]

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(pattern).map((p) => p.trim())
      const [front = '', back = '', ...rest] = parts
      const extra_data: Record<string, string> = {}
      extraFields.forEach((field, i) => {
        if (rest[i]) extra_data[field.key] = rest[i]
      })
      return { front, back, extra_data }
    })
    .filter((row) => row.front && row.back)
}
