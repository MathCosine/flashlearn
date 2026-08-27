// Normalizes a string for lenient comparison: trims, collapses whitespace,
// lowercases, and strips diacritics (so "amo" matches "amō").
function normalizeLenient(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining accent marks
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function normalizeStrict(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

// Splits an answer on common separators so a back like "to love, to like"
// accepts either synonym as a correct guess.
function alternatives(value: string): string[] {
  return value
    .split(/[,;/]|(?:\bor\b)/i)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function isAnswerCorrect(
  guess: string,
  correctAnswer: string,
  strict: boolean,
): boolean {
  if (!guess.trim()) return false

  const normalize = strict ? normalizeStrict : normalizeLenient
  const normalizedGuess = normalize(guess)

  const candidates = strict
    ? [correctAnswer]
    : [correctAnswer, ...alternatives(correctAnswer)]

  return candidates.some((c) => normalize(c) === normalizedGuess)
}
