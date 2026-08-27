import { useMemo, useState } from 'react'
import type { FlashCard } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'

export function MultipleChoice({ cards }: { cards: FlashCard[] }) {
  const [order] = useState(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [finished, setFinished] = useState(false)

  const current = order[index]

  const options = useMemo(() => {
    if (!current) return []
    const distractorPool = cards.filter((c) => c.id !== current.id)
    const distractors = [
      ...new Set(
        shuffle(distractorPool)
          .map((c) => c.back)
          .filter((b) => b !== current.back),
      ),
    ].slice(0, 3)
    return shuffle([current.back, ...distractors])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  if (cards.length < 2) {
    return (
      <p className="font-medium text-slate-600">
        You need at least 2 cards in the pool for multiple choice.
      </p>
    )
  }

  function handleSelect(option: string) {
    if (selected) return
    setSelected(option)
    setScore((s) => ({
      correct: s.correct + (option === current.back ? 1 : 0),
      total: s.total + 1,
    }))
  }

  function next() {
    if (index + 1 >= order.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
  }

  function restart() {
    setIndex(0)
    setSelected(null)
    setScore({ correct: 0, total: 0 })
    setFinished(false)
  }

  if (finished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <Panel className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-extrabold text-slate-900">✅ Quiz complete!</p>
        <p className="mt-2 font-medium text-slate-700">
          {score.correct} / {score.total} correct ({pct}%)
        </p>
        <Button onClick={restart} variant="green" className="mt-4">
          Take it again
        </Button>
      </Panel>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-bold text-slate-700">
        Question {index + 1} of {order.length} · Score: {score.correct}/
        {score.total}
      </p>
      <Panel className="w-full max-w-md bg-amber-100 p-6 text-center">
        <p className="text-2xl font-extrabold text-slate-900">
          {current.front}
        </p>
      </Panel>
      <div className="grid w-full max-w-md grid-cols-1 gap-3">
        {options.map((option) => {
          const isCorrect = option === current.back
          const isPicked = option === selected
          let bg = 'bg-white'
          if (selected) {
            if (isCorrect) bg = 'bg-emerald-300'
            else if (isPicked) bg = 'bg-rose-300'
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
              className={`rounded-xl border-[3px] border-black px-4 py-3 text-left font-bold shadow-[4px_4px_0_0_#000] transition-all disabled:opacity-100 ${bg} ${
                !selected ? 'hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000]' : ''
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      {selected && (
        <Button onClick={next} variant="blue">
          {index + 1 >= order.length ? 'See results' : 'Next →'}
        </Button>
      )}
    </div>
  )
}
