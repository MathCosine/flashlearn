import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listSets, type SetWithCount } from '../lib/api'
import type { Direction, PoolFilter, StudyMode } from '../types'
import { STUDY_MODES } from '../types'
import { colorForLabel } from '../utils/colors'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Checkbox } from '../components/ui/Field'

const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: 'front', label: 'Front → Back' },
  { id: 'back', label: 'Back → Front' },
  { id: 'mixed', label: 'Mixed' },
]

const POOLS: { id: PoolFilter; label: string }[] = [
  { id: 'all', label: 'All cards' },
  { id: 'unknown', label: 'Not yet known' },
  { id: 'starred', label: 'Starred' },
  { id: 'stubborn', label: '3+ dots' },
]

const LIMITS = [0, 10, 20, 50]

export function StudySelect() {
  const [sets, setSets] = useState<SetWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<StudyMode>('flip')
  const [direction, setDirection] = useState<Direction>('front')
  const [pool, setPool] = useState<PoolFilter>('all')
  const [shuffleOn, setShuffleOn] = useState(true)
  const [limit, setLimit] = useState(0)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselect = searchParams.get('sets')

  useEffect(() => {
    listSets()
      .then((all) => {
        setSets(all)
        if (preselect) setSelected(new Set(preselect.split(',')))
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load sets'),
      )
      .finally(() => setLoading(false))
  }, [preselect])

  const grouped = useMemo(() => {
    const map = new Map<string, SetWithCount[]>()
    for (const s of sets) {
      const key = s.category ?? 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [sets])

  const selectedCardCount = useMemo(
    () =>
      sets
        .filter((s) => selected.has(s.id))
        .reduce((sum, s) => sum + s.card_count, 0),
    [sets, selected],
  )

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function start() {
    const query = new URLSearchParams({
      sets: Array.from(selected).join(','),
      mode,
      dir: direction,
      pool,
      shuffle: shuffleOn ? '1' : '0',
      limit: String(limit),
    })
    navigate(`/study/session?${query.toString()}`)
  }

  if (loading) return <p className="font-medium text-stone-600">Loading…</p>

  return (
    <div>
      <PageHeader
        title="Study"
        description="Pick your sets — mix as many as you like — then choose how you want to drill them."
      />

      {error && (
        <Panel className="mb-4 bg-rose-200 px-4 py-2">
          <p className="text-sm font-semibold text-rose-950">{error}</p>
        </Panel>
      )}

      {sets.length === 0 ? (
        <Panel dashed flat className="bg-white p-10 text-center">
          <p className="font-medium text-stone-700">
            You don't have any sets yet.
          </p>
          <Button to="/sets/new" variant="green" className="mt-4">
            Create your first set
          </Button>
        </Panel>
      ) : (
        <div className="flex flex-col gap-5">
          <Panel className="bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-ink">1 · Choose sets</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelected(new Set(sets.map((s) => s.id)))}
                  variant="ghost"
                  size="sm"
                >
                  Select all
                </Button>
                <Button
                  onClick={() => setSelected(new Set())}
                  variant="ghost"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {Array.from(grouped.entries()).map(([category, group]) => (
                <div key={category}>
                  <Badge className={`mb-2 ${colorForLabel(category)}`}>
                    {category}
                  </Badge>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {group.map((s) => (
                      <label
                        key={s.id}
                        className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border-[3px] border-black p-2.5 font-semibold transition-colors ${
                          selected.has(s.id) ? 'bg-emerald-200' : 'bg-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selected.has(s.id)}
                            onChange={() => toggle(s.id)}
                            className="h-4 w-4 accent-emerald-500"
                          />
                          {s.name}
                        </span>
                        <span className="shrink-0 text-xs font-bold text-stone-500">
                          {s.card_count}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-ink">2 · Pick a mode</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STUDY_MODES.map((m) => {
                const active = mode === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`rounded-xl border-[3px] border-black p-3 text-left transition-all ${
                      active
                        ? `${m.color} translate-x-[3px] translate-y-[3px] shadow-none`
                        : 'bg-white shadow-hard hover:-translate-y-0.5 hover:shadow-hard-lg'
                    }`}
                  >
                    <p className="flex items-center gap-2 font-bold text-ink">
                      {m.name}
                      {m.playful && (
                        <span className="rounded-full border border-black bg-white px-1.5 text-[10px] font-bold uppercase">
                          game
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-600">
                      {m.blurb}
                    </p>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel className="bg-white p-5">
            <h2 className="mb-3 text-lg font-bold text-ink">3 · Options</h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1.5 text-sm font-bold text-ink">Direction</p>
                <div className="flex flex-wrap gap-2">
                  {DIRECTIONS.map((d) => (
                    <Badge
                      key={d.id}
                      active={direction === d.id}
                      onClick={() => setDirection(d.id)}
                    >
                      {d.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-bold text-ink">Which cards</p>
                <div className="flex flex-wrap gap-2">
                  {POOLS.map((p) => (
                    <Badge
                      key={p.id}
                      active={pool === p.id}
                      onClick={() => setPool(p.id)}
                    >
                      {p.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-bold text-ink">
                  How many cards
                </p>
                <div className="flex flex-wrap gap-2">
                  {LIMITS.map((l) => (
                    <Badge
                      key={l}
                      active={limit === l}
                      onClick={() => setLimit(l)}
                    >
                      {l === 0 ? 'All' : l}
                    </Badge>
                  ))}
                </div>
              </div>

              <Checkbox
                label="Shuffle the order"
                checked={shuffleOn}
                onChange={(e) => setShuffleOn(e.target.checked)}
              />
            </div>
          </Panel>

          <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-2xl border-[3px] border-black bg-amber-300 p-3 shadow-hard-lg">
            <Button
              onClick={start}
              disabled={selected.size === 0}
              variant="green"
              size="lg"
            >
              Start studying
            </Button>
            <p className="text-sm font-bold text-ink">
              {selected.size === 0
                ? 'Select at least one set'
                : `${selected.size} set${selected.size === 1 ? '' : 's'} · up to ${
                    limit > 0
                      ? Math.min(limit, selectedCardCount)
                      : selectedCardCount
                  } cards`}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
