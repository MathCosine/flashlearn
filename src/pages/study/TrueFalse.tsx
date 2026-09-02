import { useMemo, useState } from 'react'
import type { StudyItem, StudyModeProps } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { RichText } from '../../components/RichText'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Progress } from '../../components/ui/Progress'
import { SessionSummary } from '../../components/SessionSummary'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

interface Question {
  item: StudyItem
  shownAnswer: string
  isTruthful: boolean
}

/**
 * Builds a run of questions where roughly half pair a prompt with its real
 * answer and half with another card's answer.
 */
function buildQuestions(items: StudyItem[]): Question[] {
  const answers = [...new Set(items.map((i) => i.answer))]

  return shuffle(items).map((item) => {
    const others = answers.filter((a) => a !== item.answer)
    const truthful = others.length === 0 || Math.random() < 0.5
    return {
      item,
      shownAnswer: truthful
        ? item.answer
        : others[Math.floor(Math.random() * others.length)],
      isTruthful: truthful,
    }
  })
}

export function TrueFalse({ items, record, onFinish }: StudyModeProps) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    buildQuestions(items),
  )
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const [finished, setFinished] = useState(false)

  const current = questions[index]
  const canPlay = useMemo(() => items.length >= 2, [items.length])

  function answer(saidTrue: boolean) {
    if (feedback || !current) return
    const right = saidTrue === current.isTruthful
    setFeedback(right ? 'right' : 'wrong')
    // Only credit the card when the learner correctly accepted a true
    // pairing; spotting a false pairing proves recognition, not recall.
    record(current.item.card.id, { correct: right && current.isTruthful })
    if (right) sounds.correct()
    else sounds.wrong()

    const nextStreak = right ? streak + 1 : 0
    setStreak(nextStreak)
    setBestStreak((b) => Math.max(b, nextStreak))
    const nextTotals = {
      studied: totals.studied + 1,
      correct: totals.correct + (right ? 1 : 0),
    }
    setTotals(nextTotals)

    window.setTimeout(() => {
      setFeedback(null)
      if (index + 1 >= questions.length) {
        setFinished(true)
        onFinish(nextTotals)
      } else {
        setIndex((i) => i + 1)
      }
    }, 550)
  }

  useKey(['ArrowLeft', 'ArrowRight', 'f', 't'], (key) => {
    if (key === 'ArrowRight' || key === 't') answer(true)
    else answer(false)
  }, !finished && canPlay)

  function restart() {
    setQuestions(buildQuestions(items))
    setIndex(0)
    setFeedback(null)
    setStreak(0)
    setBestStreak(0)
    setTotals({ studied: 0, correct: 0 })
    setFinished(false)
  }

  if (!canPlay) {
    return (
      <Panel className="mx-auto max-w-md bg-white p-6 text-center">
        <p className="font-medium text-stone-700">
          True or False needs at least 2 cards so wrong pairings can be built.
        </p>
      </Panel>
    )
  }

  if (finished) {
    return (
      <SessionSummary
        title="Rapid fire done"
        studied={totals.studied}
        correct={totals.correct}
        extra={`Best streak: ${bestStreak} in a row`}
        onRestart={restart}
      />
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-sm font-bold text-stone-600">
          <span>
            {index + 1} of {questions.length}
          </span>
          <span>
            streak {streak} · best {bestStreak}
          </span>
        </div>
        <Progress value={index} max={questions.length} tone="bg-orange-400" />
      </div>

      <Panel
        className={`flex w-full max-w-xl flex-col items-center gap-3 p-8 text-center transition-colors ${
          feedback === 'right'
            ? 'bg-emerald-300'
            : feedback === 'wrong'
              ? 'animate-shake bg-rose-300'
              : 'bg-orange-100'
        }`}
      >
        <p className="text-3xl font-bold text-ink">
          <RichText text={current.item.prompt} />
        </p>
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
          means
        </p>
        <p className="text-2xl font-bold text-ink">
          <RichText text={current.shownAnswer} />
        </p>
      </Panel>

      <div className="flex gap-4">
        <Button
          onClick={() => answer(false)}
          variant="red"
          size="lg"
          disabled={Boolean(feedback)}
        >
          False
        </Button>
        <Button
          onClick={() => answer(true)}
          variant="green"
          size="lg"
          disabled={Boolean(feedback)}
        >
          True
        </Button>
      </div>

      <p className="text-xs font-medium text-stone-500">
        Arrow keys or T / F — go as fast as you can
      </p>
    </div>
  )
}
