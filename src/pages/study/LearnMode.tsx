import { type FormEvent, useMemo, useRef, useState } from 'react'
import type { StudyItem, StudyModeProps } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { isAnswerCorrect } from '../../utils/answerCheck'
import { RichText } from '../../components/RichText'
import { MacronBar, insertAtCaret } from '../../components/MacronBar'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

/**
 * Adaptive practice: a card is introduced with multiple choice, promoted to
 * typing once recognized, and only counted as mastered after it's produced
 * from memory. Missing a card sends it back a step and re-queues it.
 */
const MASTERED = 2

export function LearnMode({ items, setById, record, onFinish }: StudyModeProps) {
  const [levels, setLevels] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.card.id, 0])),
  )
  const [queue, setQueue] = useState<StudyItem[]>(() => shuffle(items))
  const [guess, setGuess] = useState('')
  const [verdict, setVerdict] = useState<'right' | 'wrong' | null>(null)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const current = queue[0]
  const level = current ? (levels[current.card.id] ?? 0) : 0
  const stage: 'choice' | 'type' = level === 0 ? 'choice' : 'type'
  const strict =
    setById.get(current?.card.set_id ?? '')?.strict_answers ?? false

  const masteredCount = Object.values(levels).filter(
    (l) => l >= MASTERED,
  ).length

  const options = useMemo(() => {
    if (!current || stage !== 'choice') return []
    const distractors = [
      ...new Set(
        shuffle(items)
          .filter((i) => i.card.id !== current.card.id)
          .map((i) => i.answer)
          .filter((a) => a !== current.answer),
      ),
    ].slice(0, 3)
    return shuffle([current.answer, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.card.id, stage])

  function submit(correct: boolean) {
    if (!current || verdict) return
    record(current.card.id, { correct })
    if (correct) sounds.correct()
    else sounds.wrong()
    setVerdict(correct ? 'right' : 'wrong')
    setTotals((t) => ({
      studied: t.studied + 1,
      correct: t.correct + (correct ? 1 : 0),
    }))

    const nextLevel = correct ? level + 1 : 0
    const nextLevels = { ...levels, [current.card.id]: nextLevel }
    setLevels(nextLevels)

    window.setTimeout(
      () => {
        setVerdict(null)
        setGuess('')

        const rest = queue.slice(1)
        // Cards that aren't mastered yet go to the back of the line.
        const requeued =
          nextLevel >= MASTERED ? rest : [...rest, current]

        if (requeued.length === 0) {
          onFinish({
            studied: totals.studied + 1,
            correct: totals.correct + (correct ? 1 : 0),
          })
        }
        setQueue(requeued)
        if (nextLevel > 0 && requeued.length > 0) {
          requestAnimationFrame(() => inputRef.current?.focus())
        }
      },
      correct ? 550 : 1400,
    )
  }

  function checkTyped(e: FormEvent) {
    e.preventDefault()
    if (!current) return
    submit(isAnswerCorrect(guess, current.answer, strict))
  }

  useKey(['1', '2', '3', '4'], (key) => {
    if (stage !== 'choice' || verdict) return
    const option = options[Number(key) - 1]
    if (option && current) submit(option === current.answer)
  })

  function restart() {
    setLevels(Object.fromEntries(items.map((i) => [i.card.id, 0])))
    setQueue(shuffle(items))
    setGuess('')
    setVerdict(null)
    setTotals({ studied: 0, correct: 0 })
  }

  if (items.length < 2) {
    return (
      <Panel className="mx-auto max-w-md bg-white p-6 text-center">
        <p className="font-medium text-stone-700">
          Learn mode needs at least 2 cards so it can build answer choices.
        </p>
      </Panel>
    )
  }

  if (!current) {
    return (
      <Panel raised className="mx-auto max-w-md bg-violet-200 p-8 text-center">
        <p className="text-2xl font-bold text-ink">All {items.length} mastered</p>
        <p className="mt-2 font-medium text-stone-700">
          Every card was recognized and then typed from memory. That took{' '}
          {totals.studied} answers.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={restart} variant="green">
            Run it again
          </Button>
          <Button to="/study" variant="neutral">
            Change mode
          </Button>
        </div>
      </Panel>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-sm font-bold text-stone-600">
          <span>
            {masteredCount} of {items.length} mastered
          </span>
          <span>{queue.length} in rotation</span>
        </div>
        <Progress
          value={masteredCount}
          max={items.length}
          tone="bg-violet-400"
        />
      </div>

      <div className="flex gap-2">
        <Badge className={stage === 'choice' ? 'bg-violet-300' : 'bg-white'}>
          1 · recognize
        </Badge>
        <Badge className={stage === 'type' ? 'bg-violet-300' : 'bg-white'}>
          2 · recall
        </Badge>
      </div>

      <Panel
        className={`w-full max-w-xl p-8 text-center transition-colors ${
          verdict === 'right'
            ? 'bg-emerald-300'
            : verdict === 'wrong'
              ? 'bg-rose-300'
              : 'bg-amber-200'
        }`}
      >
        <p className="text-3xl font-bold text-ink">
          <RichText text={current.prompt} />
        </p>
        {verdict === 'wrong' && (
          <p className="mt-3 text-lg font-semibold text-ink">
            Answer: <RichText text={current.answer} />
          </p>
        )}
      </Panel>

      {stage === 'choice' ? (
        <div className="grid w-full max-w-xl grid-cols-1 gap-3">
          {options.map((option, i) => (
            <button
              key={option}
              onClick={() => submit(option === current.answer)}
              disabled={Boolean(verdict)}
              className="flex items-center gap-3 rounded-xl border-[3px] border-black bg-white px-4 py-3 text-left text-lg font-semibold shadow-hard transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-black bg-white text-sm">
                {i + 1}
              </span>
              <RichText text={option} />
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={checkTyped} className="flex w-full max-w-xl flex-col gap-3">
          <input
            ref={inputRef}
            autoFocus
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={Boolean(verdict)}
            placeholder="Type it from memory…"
            className="fl-input text-lg"
            autoComplete="off"
            spellCheck={false}
          />
          <MacronBar
            onInsert={(char) => insertAtCaret(inputRef.current, char, setGuess)}
          />
          <Button
            type="submit"
            variant="yellow"
            size="lg"
            disabled={!guess.trim() || Boolean(verdict)}
          >
            Check
          </Button>
        </form>
      )}
    </div>
  )
}
