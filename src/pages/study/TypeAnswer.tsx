import { type FormEvent, useRef, useState } from 'react'
import type { StudyModeProps } from '../../types'
import { isAnswerCorrect } from '../../utils/answerCheck'
import { RichText } from '../../components/RichText'
import { CardImage } from '../../components/CardImage'
import { MacronBar, insertAtCaret } from '../../components/MacronBar'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Progress } from '../../components/ui/Progress'
import { SessionSummary } from '../../components/SessionSummary'
import { sounds } from '../../lib/sound'

export function TypeAnswer({
  items,
  setById,
  record,
  onFinish,
}: StudyModeProps) {
  const [index, setIndex] = useState(0)
  const [guess, setGuess] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const [finished, setFinished] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = items[index]
  const strict = setById.get(current?.card.set_id ?? '')?.strict_answers ?? false

  function check(e: FormEvent) {
    e.preventDefault()
    if (result || !current) return
    const ok = isAnswerCorrect(guess, current.answer, strict)
    setResult(ok ? 'correct' : 'wrong')
    record(current.card.id, { correct: ok })
    if (ok) sounds.correct()
    else sounds.wrong()
    setTotals((t) => ({
      studied: t.studied + 1,
      correct: t.correct + (ok ? 1 : 0),
    }))
  }

  function next() {
    if (index + 1 >= items.length) {
      setFinished(true)
      onFinish(totals)
      return
    }
    setIndex((i) => i + 1)
    setGuess('')
    setResult(null)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function restart() {
    setIndex(0)
    setGuess('')
    setResult(null)
    setTotals({ studied: 0, correct: 0 })
    setFinished(false)
  }

  if (finished) {
    return (
      <SessionSummary
        title="Typing round done"
        studied={totals.studied}
        correct={totals.correct}
        onRestart={restart}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-sm font-bold text-stone-600">
          <span>
            Card {index + 1} of {items.length}
          </span>
          <span>
            {totals.correct}/{totals.studied} correct
          </span>
        </div>
        <Progress value={index} max={items.length} />
      </div>

      <Panel className="w-full max-w-xl bg-amber-200 p-8 text-center">
        {current.card.image_url && !current.reversed && (
          <CardImage
            path={current.card.image_url}
            className="mx-auto mb-3 max-h-32"
          />
        )}
        <p className="text-3xl font-bold text-ink">
          <RichText text={current.prompt} />
        </p>
      </Panel>

      <form onSubmit={check} className="flex w-full max-w-xl flex-col gap-3">
        <input
          ref={inputRef}
          autoFocus
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={Boolean(result)}
          placeholder="Type the answer…"
          className="fl-input text-lg"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        {!result && (
          <MacronBar
            onInsert={(char) =>
              insertAtCaret(inputRef.current, char, setGuess)
            }
          />
        )}

        {!result ? (
          <Button type="submit" variant="yellow" size="lg" disabled={!guess.trim()}>
            Check
          </Button>
        ) : (
          <>
            <div
              className={`rounded-xl border-[3px] border-black px-4 py-3 text-center font-bold shadow-hard ${
                result === 'correct'
                  ? 'bg-emerald-300'
                  : 'animate-shake bg-rose-300'
              }`}
            >
              {result === 'correct' ? (
                'Correct'
              ) : (
                <span>
                  Answer: <RichText text={current.answer} />
                </span>
              )}
            </div>
            <Button type="button" onClick={next} variant="blue" size="lg" autoFocus>
              {index + 1 >= items.length ? 'See results' : 'Next →'}
            </Button>
          </>
        )}
      </form>

      <p className="text-xs font-medium text-stone-500">
        {strict
          ? 'Strict checking is on for this set — spelling, case and accents must match.'
          : 'Capitalization, spacing and accents are forgiving, and any one of several comma-separated meanings counts.'}
      </p>
    </div>
  )
}
