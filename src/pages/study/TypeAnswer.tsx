import { type FormEvent, useState } from 'react'
import type { FlashCard, FlashSet } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { isAnswerCorrect } from '../../utils/answerCheck'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'

export function TypeAnswer({
  cards,
  setById,
}: {
  cards: FlashCard[]
  setById: Map<string, FlashSet>
}) {
  const [order] = useState(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)

  const current = order[index]
  const strict = setById.get(current?.set_id ?? '')?.strict_answers ?? false

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (result) return
    const ok = isAnswerCorrect(guess, current.back, strict)
    setResult(ok ? 'correct' : 'wrong')
    setScore((s) => ({ correct: s.correct + (ok ? 1 : 0), total: s.total + 1 }))
  }

  function next() {
    if (index + 1 >= order.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setGuess('')
    setResult(null)
  }

  function restart() {
    setIndex(0)
    setGuess('')
    setResult(null)
    setScore({ correct: 0, total: 0 })
    setFinished(false)
  }

  if (finished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <Panel className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-extrabold text-slate-900">⌨️ Done!</p>
        <p className="mt-2 font-medium text-slate-700">
          {score.correct} / {score.total} correct ({pct}%)
        </p>
        <Button onClick={restart} variant="green" className="mt-4">
          Try again
        </Button>
      </Panel>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-bold text-slate-700">
        Card {index + 1} of {order.length} · Score: {score.correct}/
        {score.total}
      </p>
      <Panel className="w-full max-w-md bg-amber-100 p-6 text-center">
        <p className="text-2xl font-extrabold text-slate-900">
          {current.front}
        </p>
      </Panel>

      <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3">
        <input
          autoFocus
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={!!result}
          placeholder="Type the answer…"
          className="rounded-lg border-[3px] border-black bg-white px-3 py-2 text-lg font-medium disabled:opacity-70"
        />
        {!result ? (
          <Button type="submit" variant="yellow" disabled={!guess.trim()}>
            Check
          </Button>
        ) : (
          <>
            <p
              className={`rounded-lg border-[3px] border-black px-3 py-2 text-center font-bold ${
                result === 'correct' ? 'bg-emerald-300' : 'bg-rose-300'
              }`}
            >
              {result === 'correct'
                ? '✅ Correct!'
                : `❌ Correct answer: ${current.back}`}
            </p>
            <Button type="button" onClick={next} variant="blue">
              {index + 1 >= order.length ? 'See results' : 'Next →'}
            </Button>
          </>
        )}
      </form>

      {!strict && (
        <p className="text-xs font-medium text-slate-500">
          Lenient mode: capitalization, extra spaces, and accents don't need
          to be exact.
        </p>
      )}
    </div>
  )
}
