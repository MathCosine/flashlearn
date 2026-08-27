import { useState } from 'react'
import type { FlashCard, FlashSet } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { FlashCardView } from '../../components/FlashCardView'
import { Button } from '../../components/ui/Button'

export function ClassicFlip({
  cards,
  setById,
}: {
  cards: FlashCard[]
  setById: Map<string, FlashSet>
}) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = cards[order[index]]

  function go(delta: number) {
    setFlipped(false)
    setIndex((i) => Math.max(0, Math.min(order.length - 1, i + delta)))
  }

  function handleShuffle() {
    setOrder(shuffle(cards.map((_, i) => i)))
    setIndex(0)
    setFlipped(false)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="font-bold text-slate-700">
        Card {index + 1} of {order.length}
      </p>
      <FlashCardView
        card={current}
        set={setById.get(current.set_id)}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />
      <div className="flex gap-3">
        <Button onClick={() => go(-1)} disabled={index === 0} variant="blue">
          ← Prev
        </Button>
        <Button onClick={() => setFlipped((f) => !f)} variant="yellow">
          Flip
        </Button>
        <Button
          onClick={() => go(1)}
          disabled={index === order.length - 1}
          variant="blue"
        >
          Next →
        </Button>
      </div>
      <Button onClick={handleShuffle} variant="neutral" size="sm">
        🔀 Shuffle
      </Button>
    </div>
  )
}
