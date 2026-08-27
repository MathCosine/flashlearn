import { useEffect, useRef, useState } from 'react'
import type { FlashCard, FlashSet } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'

const DURATION_SECONDS = 5 * 60

export function SpeedRound({
  cards,
  setById,
}: {
  cards: FlashCard[]
  setById: Map<string, FlashSet>
}) {
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS)
  const [order, setOrder] = useState<FlashCard[]>(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [correct, setCorrect] = useState(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (phase !== 'running') return
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(intervalRef.current!)
          setPhase('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [phase])

  function start() {
    setOrder(shuffle(cards))
    setIndex(0)
    setFlipped(false)
    setReviewed(0)
    setCorrect(0)
    setTimeLeft(DURATION_SECONDS)
    setPhase('running')
  }

  function grade(knewIt: boolean) {
    setReviewed((r) => r + 1)
    if (knewIt) setCorrect((c) => c + 1)
    setFlipped(false)
    setIndex((i) => (i + 1) % order.length)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (phase === 'ready') {
    return (
      <Panel className="mx-auto max-w-md bg-yellow-100 p-8 text-center">
        <p className="text-2xl font-extrabold text-slate-900">Speed Round</p>
        <p className="mt-2 font-medium text-slate-700">
          5 minutes, shuffled cards, self-graded. Great for a quick daily
          review. Ready?
        </p>
        <Button onClick={start} variant="green" className="mt-4">
          Start 5-minute round
        </Button>
      </Panel>
    )
  }

  if (phase === 'done') {
    const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0
    return (
      <Panel className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-extrabold text-slate-900">Time's up!</p>
        <p className="mt-2 font-medium text-slate-700">
          Reviewed {reviewed} card{reviewed === 1 ? '' : 's'} — {correct}{' '}
          correct ({accuracy}%)
        </p>
        <Button onClick={start} variant="green" className="mt-4">
          Go again
        </Button>
      </Panel>
    )
  }

  const current = order[index]

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex gap-3 text-sm font-bold">
        <span className="rounded-full border-2 border-black bg-rose-200 px-4 py-1 text-lg tabular-nums">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        <span className="rounded-full border-2 border-black bg-white px-3 py-1">
          Reviewed: {reviewed}
        </span>
        <span className="rounded-full border-2 border-black bg-emerald-200 px-3 py-1">
          Correct: {correct}
        </span>
      </div>

      <FlashCardView
        key={current.id}
        card={current}
        set={setById.get(current.set_id)}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      {!flipped ? (
        <Button onClick={() => setFlipped(true)} variant="yellow">
          Flip
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button onClick={() => grade(false)} variant="red">
            Missed it
          </Button>
          <Button onClick={() => grade(true)} variant="green">
            Knew it
          </Button>
        </div>
      )}
    </div>
  )
}
