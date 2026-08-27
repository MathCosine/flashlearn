import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { listCardsForSets, listSets } from '../lib/api'
import type { FlashSet, StudyMode } from '../types'
import { STUDY_MODES } from '../types'
import { colorForLabel } from '../utils/colors'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

export function StudySelect() {
  const [sets, setSets] = useState<FlashSet[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<StudyMode>('flip')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    listSets()
      .then((all) => {
        setSets(all)
        const preselect = searchParams.get('sets')
        if (preselect) {
          setSelected(new Set(preselect.split(',')))
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load sets'),
      )
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, FlashSet[]>()
    for (const s of sets) {
      const key = s.category ?? 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [sets])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleStart() {
    if (selected.size === 0) return
    setStarting(true)
    setError(null)
    try {
      const setIds = Array.from(selected)
      const cards = await listCardsForSets(setIds)
      if (cards.length === 0) {
        setError('The selected set(s) have no cards yet.')
        return
      }
      const selectedSets = sets.filter((s) => selected.has(s.id))
      navigate('/study/session', {
        state: { cards, sets: selectedSets, mode },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setStarting(false)
    }
  }

  if (loading) return <p className="font-medium text-slate-600">Loading…</p>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="mb-1 text-3xl font-extrabold text-slate-900">
          Study
        </h1>
        <p className="font-medium text-slate-600">
          Pick one or more sets — mix across categories for combined practice
          — then choose a study mode.
        </p>
      </div>

      {sets.length === 0 ? (
        <Panel dashed flat className="bg-white p-8 text-center">
          <p className="font-medium text-slate-700">
            You don't have any sets yet.
          </p>
          <Button to="/" variant="green" className="mt-3">
            Go create one
          </Button>
        </Panel>
      ) : (
        <Panel className="bg-white p-5">
          <h2 className="mb-3 text-lg font-extrabold text-slate-900">
            1. Choose sets
          </h2>
          <div className="flex flex-col gap-4">
            {Array.from(grouped.entries()).map(([category, group]) => (
              <div key={category}>
                <span
                  className={`mb-2 inline-block rounded-full border-2 px-2 py-0.5 text-xs font-bold ${colorForLabel(category)}`}
                >
                  {category}
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {group.map((s) => (
                    <label
                      key={s.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border-[3px] border-black p-2 font-bold ${
                        selected.has(s.id) ? 'bg-emerald-200' : 'bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={() => toggle(s.id)}
                        className="h-4 w-4"
                      />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="bg-white p-5">
        <h2 className="mb-3 text-lg font-extrabold text-slate-900">
          2. Choose a study mode
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {STUDY_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-xl border-[3px] border-black p-3 text-left transition-all ${
                mode === m.id
                  ? 'bg-sky-300 shadow-none translate-x-[3px] translate-y-[3px]'
                  : 'bg-white shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000]'
              }`}
            >
              <p className="font-extrabold text-slate-900">{m.name}</p>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {m.blurb}
              </p>
            </button>
          ))}
        </div>
      </Panel>

      {error && (
        <p className="rounded-lg border-[3px] border-black bg-rose-200 px-3 py-2 text-sm font-semibold text-rose-950">
          {error}
        </p>
      )}

      <Button
        onClick={handleStart}
        disabled={selected.size === 0 || starting}
        variant="green"
        className="self-start text-lg"
      >
        {starting ? 'Loading…' : 'Start Studying'}
      </Button>
    </div>
  )
}
