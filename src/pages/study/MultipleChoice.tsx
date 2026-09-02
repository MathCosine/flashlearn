import { useMemo, useState } from 'react'
import type { StudyModeProps } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { RichText } from '../../components/RichText'
import { CardImage } from '../../components/CardImage'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { SessionSummary } from '../../components/SessionSummary'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

export function MultipleChoice({
  items,
  record,
  onFinish,
}: StudyModeProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const [finished, setFinished] = useState(false)

  const current = items[index]

  const options = useMemo(() => {
    if (!current) return []
    // Distractors come from the other cards' answers, de-duplicated so an
    // option can never appear twice.
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
  }, [index])

  function choose(option: string) {
    if (selected || !current) return
    const isCorrect = option === current.answer
    setSelected(option)
    record(current.card.id, { correct: isCorrect })
    if (isCorrect) sounds.correct()
    else sounds.wrong()
    setTotals((t) => ({
      studied: t.studied + 1,
      correct: t.correct + (isCorrect ? 1 : 0),
    }))
  }

  function next() {
    if (index + 1 >= items.length) {
      setFinished(true)
      onFinish(totals)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  useKey(['1', '2', '3', '4', 'Enter'], (key) => {
    if (key === 'Enter') {
      if (selected) next()
      return
    }
    const optionIndex = Number(key) - 1
    if (options[optionIndex]) choose(options[optionIndex])
  }, !finished)

  function restart() {
    setIndex(0)
    setSelected(null)
    setTotals({ studied: 0, correct: 0 })
    setFinished(false)
  }

  if (items.length < 2) {
    return (
      <Panel className="mx-auto max-w-md bg-white p-6 text-center">
        <p className="font-medium text-stone-700">
          Multiple choice needs at least 2 cards so there's something to
          choose between.
        </p>
      </Panel>
    )
  }

  if (finished) {
    return (
      <SessionSummary
        title="Quiz complete"
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
            Question {index + 1} of {items.length}
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

      <div className="grid w-full max-w-xl grid-cols-1 gap-3">
        {options.map((option, i) => {
          const isCorrect = option === current.answer
          const isPicked = option === selected
          let tone = 'bg-white hover:bg-stone-50'
          if (selected) {
            if (isCorrect) tone = 'bg-emerald-300'
            else if (isPicked) tone = 'bg-rose-300 animate-shake'
            else tone = 'bg-white opacity-60'
          }
          return (
            <button
              key={option}
              onClick={() => choose(option)}
              disabled={Boolean(selected)}
              className={`flex items-center gap-3 rounded-xl border-[3px] border-black px-4 py-3 text-left text-lg font-semibold shadow-hard transition-transform disabled:cursor-default ${tone} ${
                selected ? '' : 'hover:-translate-y-0.5'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 border-black bg-white text-sm">
                {i + 1}
              </span>
              <RichText text={option} />
            </button>
          )
        })}
      </div>

      {selected && (
        <Button onClick={next} variant="blue" size="lg">
          {index + 1 >= items.length ? 'See results' : 'Next →'}
        </Button>
      )}

      {!selected && (
        <div className="flex gap-2">
          <Badge className="bg-white">Press 1–4 to answer</Badge>
        </div>
      )}
    </div>
  )
}
