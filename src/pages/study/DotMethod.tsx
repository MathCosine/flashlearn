import { useState } from 'react'
import type { StudyModeProps } from '../../types'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

export function DotMethod({
  items,
  setById,
  progressByCard,
  record,
  onFinish,
}: StudyModeProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const [passes, setPasses] = useState(1)

  const current = items[index]
  const progress = current ? progressByCard[current.card.id] : undefined
  const dots = progress?.dots ?? 0

  function next() {
    setFlipped(false)
    const upcoming = index + 1
    if (upcoming >= items.length) {
      setIndex(0)
      setPasses((p) => p + 1)
    } else {
      setIndex(upcoming)
    }
  }

  function answer(gotIt: boolean) {
    if (!current) return
    record(current.card.id, { correct: gotIt, addDot: !gotIt })
    if (gotIt) sounds.correct()
    else sounds.wrong()
    setTotals((t) => ({
      studied: t.studied + 1,
      correct: t.correct + (gotIt ? 1 : 0),
    }))
    next()
  }

  useKey(['Space', '1', '2'], (key) => {
    if (key === 'Space') {
      sounds.flip()
      setFlipped((f) => !f)
    } else if (flipped) {
      answer(key === '2')
    }
  })

  const totalDots = Object.values(progressByCard).reduce(
    (sum, p) => sum + (p?.dots ?? 0),
    0,
  )

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-2">
        <Badge>
          Card {index + 1} of {items.length}
        </Badge>
        <Badge className="bg-sky-200 text-sky-950">Pass {passes}</Badge>
        <Badge className="bg-rose-200 text-rose-950">
          {dots} dot{dots === 1 ? '' : 's'} on this card
        </Badge>
        <Badge className="bg-white">{totalDots} dots total</Badge>
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
        dots={dots}
        onToggleStar={() =>
          record(current.card.id, { starred: !progress?.starred })
        }
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
          Flip to check
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button onClick={() => answer(false)} variant="red" size="lg">
            Add a dot
          </Button>
          <Button onClick={() => answer(true)} variant="green" size="lg">
            Got it
          </Button>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium text-stone-500">
          This mode loops forever — dots are saved to your account as you go.
        </p>
        <Button
          onClick={() => onFinish(totals)}
          variant="neutral"
          size="sm"
          disabled={totals.studied === 0}
        >
          End session
        </Button>
      </div>
    </div>
  )
}
