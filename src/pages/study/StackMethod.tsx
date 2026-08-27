import { useState } from 'react'
import type { FlashCard, FlashSet } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'

export function StackMethod({
  cards,
  setById,
}: {
  cards: FlashCard[]
  setById: Map<string, FlashSet>
}) {
  const [queue, setQueue] = useState<FlashCard[]>(() => shuffle(cards))
  const [notYetPile, setNotYetPile] = useState<FlashCard[]>([])
  const [round, setRound] = useState(1)
  const [knownThisRound, setKnownThisRound] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)

  const current = queue[0]

  function advance(knewIt: boolean) {
    const rest = queue.slice(1)
    const nextNotYet = knewIt ? notYetPile : [...notYetPile, current]
    setFlipped(false)

    if (rest.length > 0) {
      setQueue(rest)
      setNotYetPile(nextNotYet)
      if (knewIt) setKnownThisRound((k) => k + 1)
      return
    }

    if (knewIt) setKnownThisRound((k) => k + 1)

    if (nextNotYet.length === 0) {
      setFinished(true)
      setQueue([])
      setNotYetPile([])
    } else {
      setQueue(shuffle(nextNotYet))
      setNotYetPile([])
      setRound((r) => r + 1)
      setKnownThisRound(0)
    }
  }

  function restart() {
    setQueue(shuffle(cards))
    setNotYetPile([])
    setRound(1)
    setKnownThisRound(0)
    setFlipped(false)
    setFinished(false)
  }

  if (finished) {
    return (
      <Panel className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
        <p className="text-2xl font-extrabold text-slate-900">
          All {cards.length} cards known!
        </p>
        <p className="mt-2 font-medium text-slate-700">
          It took {round} round{round === 1 ? '' : 's'} through the stack.
        </p>
        <Button onClick={restart} variant="green" className="mt-4">
          Study again
        </Button>
      </Panel>
    )
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap justify-center gap-4 text-sm font-bold">
        <span className="rounded-full border-2 border-black bg-sky-200 px-3 py-1">
          Round {round}
        </span>
        <span className="rounded-full border-2 border-black bg-white px-3 py-1">
          {queue.length} left this round
        </span>
        <span className="rounded-full border-2 border-black bg-emerald-200 px-3 py-1">
          {knownThisRound} known so far
        </span>
        <span className="rounded-full border-2 border-black bg-rose-200 px-3 py-1">
          {notYetPile.length} in "not yet" pile
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
          Flip to check
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button onClick={() => advance(false)} variant="red">
            Not yet
          </Button>
          <Button onClick={() => advance(true)} variant="green">
            Knew it
          </Button>
        </div>
      )}
    </div>
  )
}
