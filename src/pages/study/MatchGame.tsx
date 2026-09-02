import { useEffect, useMemo, useRef, useState } from 'react'
import type { StudyItem, StudyModeProps } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { formatSeconds, getBestTime, saveBestTime } from '../../utils/bestTimes'
import { RichText } from '../../components/RichText'
import { Button } from '../../components/ui/Button'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { sounds } from '../../lib/sound'

const BOARD_SIZE = 6 // pairs per board

interface Tile {
  id: string
  cardId: string
  text: string
  side: 'prompt' | 'answer'
}

function buildTiles(items: StudyItem[]): Tile[] {
  return shuffle(
    items.flatMap((item) => [
      {
        id: `${item.card.id}:prompt`,
        cardId: item.card.id,
        text: item.prompt,
        side: 'prompt' as const,
      },
      {
        id: `${item.card.id}:answer`,
        cardId: item.card.id,
        text: item.answer,
        side: 'answer' as const,
      },
    ]),
  )
}

export function MatchGame({ items, record, onFinish }: StudyModeProps) {
  const round = useMemo(() => shuffle(items).slice(0, BOARD_SIZE), [items])
  const signature = useMemo(
    () =>
      round
        .map((i) => i.card.id)
        .sort()
        .join(','),
    [round],
  )

  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles(round))
  const [picked, setPicked] = useState<Tile | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<string[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const [best, setBest] = useState<number | null>(() => getBestTime(signature))
  const [beatBest, setBeatBest] = useState(false)
  const [completed, setCompleted] = useState(false)
  // Guards against the final pair being scored twice by a double click.
  const finishedRef = useRef(false)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setElapsed((e) => e + 0.1), 100)
    return () => window.clearInterval(id)
  }, [running])

  const totalPairs = round.length

  function pick(tile: Tile) {
    if (!running || matched.has(tile.cardId) || wrongPair.length > 0) return
    if (picked && picked.id === tile.id) {
      setPicked(null)
      return
    }
    if (!picked) {
      setPicked(tile)
      sounds.flip()
      return
    }

    if (picked.cardId === tile.cardId && picked.side !== tile.side) {
      const nextMatched = new Set(matched).add(tile.cardId)
      setMatched(nextMatched)
      setPicked(null)
      record(tile.cardId, { correct: true })
      sounds.match()

      if (nextMatched.size === totalPairs && !finishedRef.current) {
        finishedRef.current = true
        setRunning(false)
        setCompleted(true)
        const seconds = Math.round(elapsed * 10) / 10
        const improved = saveBestTime(signature, seconds)
        setBeatBest(improved)
        setBest(getBestTime(signature))
        onFinish({
          studied: totalPairs,
          correct: Math.max(0, totalPairs - mistakes),
        })
      }
      return
    }

    // Wrong pairing: flash both tiles, then clear.
    setMistakes((m) => m + 1)
    record(tile.cardId, { correct: false })
    sounds.wrong()
    setWrongPair([picked.id, tile.id])
    window.setTimeout(() => {
      setWrongPair([])
      setPicked(null)
    }, 450)
  }

  function restart() {
    finishedRef.current = false
    setCompleted(false)
    setTiles(buildTiles(round))
    setPicked(null)
    setMatched(new Set())
    setWrongPair([])
    setMistakes(0)
    setElapsed(0)
    setBeatBest(false)
    setRunning(true)
  }

  if (items.length < 2) {
    return (
      <Panel className="mx-auto max-w-md bg-white p-6 text-center">
        <p className="font-medium text-stone-700">
          The match game needs at least 2 cards.
        </p>
      </Panel>
    )
  }

  if (completed) {
    const seconds = Math.round(elapsed * 10) / 10
    return (
      <Panel raised className="mx-auto max-w-md bg-fuchsia-200 p-8 text-center">
        <p className="text-2xl font-bold text-ink">Board cleared</p>
        <p className="mt-3 text-5xl font-bold tabular-nums text-ink">
          {seconds.toFixed(1)}s
        </p>
        {beatBest && (
          <p className="mt-2 font-bold text-emerald-800">New personal best</p>
        )}
        {best !== null && !beatBest && (
          <p className="mt-2 text-sm font-medium text-stone-700">
            Your best for these cards: {best.toFixed(1)}s
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-stone-700">
          {mistakes} mismatch{mistakes === 1 ? '' : 'es'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={restart} variant="green">
            Play again
          </Button>
          <Button to="/study" variant="neutral">
            Change mode
          </Button>
        </div>
      </Panel>
    )
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        <Badge className="bg-white">
          <span className="tabular-nums">{elapsed.toFixed(1)}s</span>
        </Badge>
        <Badge className="bg-emerald-200 text-emerald-950">
          {matched.size}/{totalPairs} pairs
        </Badge>
        <Badge className="bg-rose-200 text-rose-950">
          {mistakes} mismatch{mistakes === 1 ? '' : 'es'}
        </Badge>
        {best !== null && (
          <Badge className="bg-amber-200 text-amber-950">
            best {formatSeconds(best)}
          </Badge>
        )}
      </div>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.cardId)
          const isPicked = picked?.id === tile.id
          const isWrong = wrongPair.includes(tile.id)

          let tone = 'bg-white hover:bg-stone-50 hover:-translate-y-0.5'
          if (isMatched) tone = 'invisible'
          else if (isWrong) tone = 'animate-shake bg-rose-300'
          else if (isPicked) tone = 'bg-sky-300 translate-x-[3px] translate-y-[3px] shadow-none'

          return (
            <button
              key={tile.id}
              onClick={() => pick(tile)}
              disabled={isMatched}
              className={`flex min-h-24 items-center justify-center rounded-xl border-[3px] border-black p-3 text-center text-base font-semibold shadow-hard transition-all ${tone}`}
            >
              <RichText text={tile.text} />
            </button>
          )
        })}
      </div>

      <p className="text-xs font-medium text-stone-500">
        Tap a prompt, then its matching answer. Clear the board as fast as you
        can.
      </p>
    </div>
  )
}
