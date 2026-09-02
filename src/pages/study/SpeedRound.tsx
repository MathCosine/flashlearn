import { useEffect, useRef, useState } from 'react'
import type { StudyModeProps } from '../../types'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Progress } from '../../components/ui/Progress'
import { SessionSummary } from '../../components/SessionSummary'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

const DURATIONS = [60, 180, 300] as const

export function SpeedRound({
  items,
  setById,
  progressByCard,
  record,
  onFinish,
}: StudyModeProps) {
  const [duration, setDuration] = useState<number>(300)
  const [phase, setPhase] = useState<'ready' | 'running' | 'done'>('ready')
  const [timeLeft, setTimeLeft] = useState(duration)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const totalsRef = useRef(totals)
  totalsRef.current = totals

  useEffect(() => {
    if (phase !== 'running') return
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) return 0
        if (t <= 6) sounds.tick()
        return t - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  // Ending the round lives in its own effect rather than inside the state
  // updater, which React may run more than once per tick.
  useEffect(() => {
    if (phase === 'running' && timeLeft === 0) {
      setPhase('done')
      onFinish(totalsRef.current)
    }
    // onFinish is stable for the life of the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft])

  function start() {
    setTimeLeft(duration)
    setIndex(0)
    setFlipped(false)
    setTotals({ studied: 0, correct: 0 })
    setPhase('running')
  }

  const current = items[index % items.length]
  const progress = current ? progressByCard[current.card.id] : undefined

  function grade(knewIt: boolean) {
    if (!current) return
    record(current.card.id, { correct: knewIt })
    if (knewIt) sounds.correct()
    else sounds.wrong()
    setTotals((t) => ({
      studied: t.studied + 1,
      correct: t.correct + (knewIt ? 1 : 0),
    }))
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  useKey(['Space', '1', '2'], (key) => {
    if (key === 'Space') {
      sounds.flip()
      setFlipped((f) => !f)
    } else if (flipped) {
      grade(key === '2')
    }
  }, phase === 'running')

  if (phase === 'ready') {
    return (
      <Panel raised className="mx-auto max-w-md bg-amber-100 p-8 text-center">
        <p className="text-2xl font-bold text-ink">Speed Round</p>
        <p className="mt-2 font-medium text-stone-700">
          Shuffled cards against a clock. Grade yourself fast and keep moving.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {DURATIONS.map((d) => (
            <Badge
              key={d}
              active={duration === d}
              onClick={() => setDuration(d)}
            >
              {d / 60} min
            </Badge>
          ))}
        </div>
        <Button onClick={start} variant="green" size="lg" className="mt-5">
          Start
        </Button>
      </Panel>
    )
  }

  if (phase === 'done') {
    return (
      <SessionSummary
        title="Time's up"
        studied={totals.studied}
        correct={totals.correct}
        onRestart={start}
      />
    )
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const urgent = timeLeft <= 10

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex items-center justify-between">
          <span
            className={`rounded-xl border-[3px] border-black px-4 py-1 text-2xl font-bold tabular-nums shadow-hard-sm ${
              urgent ? 'animate-pop bg-rose-300' : 'bg-white'
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <div className="flex gap-2">
            <Badge className="bg-white">{totals.studied} seen</Badge>
            <Badge className="bg-emerald-200 text-emerald-950">
              {totals.correct} correct
            </Badge>
          </div>
        </div>
        <Progress
          value={timeLeft}
          max={duration}
          tone={urgent ? 'bg-rose-400' : 'bg-amber-400'}
        />
      </div>

      <FlashCardView
        key={`${current.card.id}-${index}`}
        item={current}
        set={setById.get(current.card.set_id)}
        flipped={flipped}
        onFlip={() => {
          sounds.flip()
          setFlipped((f) => !f)
        }}
        starred={progress?.starred}
        dots={progress?.dots ?? 0}
      />

      {!flipped ? (
        <Button
          onClick={() => {
            sounds.flip()
            setFlipped(true)
          }}
          variant="yellow"
          size="lg"
        >
          Flip
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button onClick={() => grade(false)} variant="red" size="lg">
            Missed it
          </Button>
          <Button onClick={() => grade(true)} variant="green" size="lg">
            Knew it
          </Button>
        </div>
      )}
    </div>
  )
}
