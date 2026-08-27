import { useEffect, useMemo, useState } from 'react'
import type { FlashCard, FlashSet } from '../../types'
import { listProgressForCards, upsertProgress } from '../../lib/api'
import { shuffle } from '../../utils/shuffle'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'

export function DotMethod({
  cards,
  setById,
}: {
  cards: FlashCard[]
  setById: Map<string, FlashSet>
}) {
  const [dotsByCard, setDotsByCard] = useState<Record<string, number>>({})
  const [loaded, setLoaded] = useState(false)
  const [focusStubborn, setFocusStubborn] = useState(false)
  const [order, setOrder] = useState<FlashCard[]>(() => shuffle(cards))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    listProgressForCards(cards.map((c) => c.id)).then((progress) => {
      const map: Record<string, number> = {}
      progress.forEach((p) => {
        map[p.card_id] = p.dots
      })
      setDotsByCard(map)
      setLoaded(true)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeCards = useMemo(() => {
    const pool = focusStubborn
      ? cards.filter((c) => (dotsByCard[c.id] ?? 0) >= 3)
      : cards
    return pool
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusStubborn, cards, loaded])

  useEffect(() => {
    setOrder(shuffle(activeCards))
    setIndex(0)
    setFlipped(false)
  }, [activeCards])

  if (!loaded) return <p className="font-medium text-slate-600">Loading progress…</p>

  if (order.length === 0) {
    return (
      <p className="font-medium text-slate-600">
        No cards with 3+ dots yet — nice! Toggle back to "All cards".
      </p>
    )
  }

  const current = order[index % order.length]
  const currentDots = dotsByCard[current.id] ?? 0

  function next() {
    setFlipped(false)
    setIndex((i) => (i + 1) % order.length)
  }

  async function markGotIt() {
    await upsertProgress({ card_id: current.id, known: true })
    next()
  }

  async function addDot() {
    const newDots = currentDots + 1
    setDotsByCard((prev) => ({ ...prev, [current.id]: newDots }))
    await upsertProgress({ card_id: current.id, dots: newDots, known: false })
    next()
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <input
          type="checkbox"
          checked={focusStubborn}
          onChange={(e) => setFocusStubborn(e.target.checked)}
          className="h-4 w-4"
        />
        Focus on stubborn cards (3+ dots) only
      </label>

      <div className="flex items-center gap-2">
        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-sm font-bold">
          Card {index + 1} of {order.length} (loops indefinitely)
        </span>
        <span className="rounded-full border-2 border-black bg-rose-200 px-3 py-1 text-sm font-bold">
          {'●'.repeat(currentDots) || '0'} dot{currentDots === 1 ? '' : 's'}
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
          <Button onClick={addDot} variant="red">
            Add a dot (didn't know it)
          </Button>
          <Button onClick={markGotIt} variant="green">
            Got it
          </Button>
        </div>
      )}
    </div>
  )
}
