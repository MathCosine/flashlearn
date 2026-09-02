import { useState } from 'react'
import type { StudyModeProps } from '../../types'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Progress } from '../../components/ui/Progress'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

export function ClassicFlip({
  items,
  setById,
  progressByCard,
  record,
  onFinish,
}: StudyModeProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seen, setSeen] = useState<Set<number>>(new Set([0]))
  const [done, setDone] = useState(false)

  const current = items[index]
  const progress = current ? progressByCard[current.card.id] : undefined

  function go(delta: number) {
    const next = index + delta
    if (next < 0) return
    if (next >= items.length) {
      if (current) record(current.card.id, {})
      // Flip is review, not a graded quiz, so nothing is reported as
      // "correct" — the session is logged purely so the day counts.
      onFinish({ studied: seen.size, correct: 0 })
      setDone(true)
      return
    }
    if (current) record(current.card.id, {})
    setFlipped(false)
    setIndex(next)
    setSeen((prev) => new Set(prev).add(next))
  }

  function flip() {
    sounds.flip()
    setFlipped((f) => !f)
  }

  useKey(['Space', 'ArrowRight', 'ArrowLeft'], (key) => {
    if (key === 'Space') flip()
    else if (key === 'ArrowRight') go(1)
    else go(-1)
  }, !done)

  function restart() {
    setIndex(0)
    setFlipped(false)
    setSeen(new Set([0]))
    setDone(false)
  }

  if (done) {
    return (
      <Panel raised className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-bold text-ink">Deck complete</p>
        <p className="mt-2 font-medium text-stone-700">
          You went through all {items.length} card
          {items.length === 1 ? '' : 's'}.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={restart} variant="green">
            Go again
          </Button>
          <Button to="/study" variant="neutral">
            Change mode
          </Button>
        </div>
      </Panel>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-xl">
        <div className="mb-2 flex justify-between text-sm font-bold text-stone-600">
          <span>
            Card {index + 1} of {items.length}
          </span>
          <span>{seen.size} seen</span>
        </div>
        <Progress value={index + 1} max={items.length} />
      </div>

      <FlashCardView
        key={current.card.id}
        item={current}
        set={setById.get(current.card.set_id)}
        flipped={flipped}
        onFlip={flip}
        starred={progress?.starred}
        dots={progress?.dots ?? 0}
        onToggleStar={() =>
          record(current.card.id, { starred: !progress?.starred })
        }
      />

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => go(-1)} disabled={index === 0} variant="neutral">
          ← Prev
        </Button>
        <Button onClick={flip} variant="yellow">
          Flip
        </Button>
        <Button onClick={() => go(1)} variant="blue">
          {index === items.length - 1 ? 'Finish' : 'Next →'}
        </Button>
      </div>

      <p className="text-xs font-medium text-stone-500">
        Space flips · arrow keys move
      </p>
    </div>
  )
}
