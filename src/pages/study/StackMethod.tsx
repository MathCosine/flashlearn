import { useState } from 'react'
import type { StudyItem, StudyModeProps } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { useKey } from '../../hooks/useKey'
import { sounds } from '../../lib/sound'

export function StackMethod({
  items,
  setById,
  progressByCard,
  record,
  onFinish,
}: StudyModeProps) {
  const [queue, setQueue] = useState<StudyItem[]>(() => shuffle(items))
  const [notYet, setNotYet] = useState<StudyItem[]>([])
  const [round, setRound] = useState(1)
  const [knownThisRound, setKnownThisRound] = useState(0)
  const [totals, setTotals] = useState({ studied: 0, correct: 0 })
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  const current = queue[0]
  const progress = current ? progressByCard[current.card.id] : undefined

  function advance(knewIt: boolean) {
    if (!current) return
    record(current.card.id, { correct: knewIt })
    if (knewIt) sounds.correct()
    else sounds.wrong()

    const nextTotals = {
      studied: totals.studied + 1,
      correct: totals.correct + (knewIt ? 1 : 0),
    }
    setTotals(nextTotals)

    const rest = queue.slice(1)
    const nextNotYet = knewIt ? notYet : [...notYet, current]
    if (knewIt) setKnownThisRound((k) => k + 1)
    setFlipped(false)

    if (rest.length > 0) {
      setQueue(rest)
      setNotYet(nextNotYet)
      return
    }

    if (nextNotYet.length === 0) {
      setQueue([])
      setNotYet([])
      setFinished(true)
      onFinish(nextTotals)
      return
    }

    // Round over, but cards remain: start again with just the "not yet" pile.
    setQueue(shuffle(nextNotYet))
    setNotYet([])
    setRound((r) => r + 1)
    setKnownThisRound(0)
  }

  useKey(['Space', '1', '2'], (key) => {
    if (key === 'Space') {
      sounds.flip()
      setFlipped((f) => !f)
    } else if (flipped) {
      advance(key === '2')
    }
  }, !finished)

  function restart() {
    setQueue(shuffle(items))
    setNotYet([])
    setRound(1)
    setKnownThisRound(0)
    setTotals({ studied: 0, correct: 0 })
    setFlipped(false)
    setFinished(false)
  }

  if (finished) {
    return (
      <Panel raised className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-bold text-ink">
          Every card is in the known pile
        </p>
        <p className="mt-2 font-medium text-stone-700">
          It took {round} round{round === 1 ? '' : 's'} and{' '}
          {totals.studied} look
          {totals.studied === 1 ? '' : 's'} to clear all {items.length} cards.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={restart} variant="green">
            Study again
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
      <div className="flex flex-wrap justify-center gap-2">
        <Badge className="bg-sky-200 text-sky-950">Round {round}</Badge>
        <Badge>{queue.length} left this round</Badge>
        <Badge className="bg-emerald-200 text-emerald-950">
          {knownThisRound} known
        </Badge>
        <Badge className="bg-rose-200 text-rose-950">
          {notYet.length} not yet
        </Badge>
      </div>

      <FlashCardView
        key={current.card.id}
        item={current}
        set={setById.get(current.card.set_id)}
        flipped={flipped}
        onFlip={() => {
          sounds.flip()
          setFlipped((f) => !f)
        }}
        starred={progress?.starred}
        dots={progress?.dots ?? 0}
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
          <Button onClick={() => advance(false)} variant="red" size="lg">
            Not yet
          </Button>
          <Button onClick={() => advance(true)} variant="green" size="lg">
            I knew it
          </Button>
        </div>
      )}

      <p className="text-xs font-medium text-stone-500">
        Space flips · 1 = not yet · 2 = knew it
      </p>
    </div>
  )
}
