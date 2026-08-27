import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteSet, listSets } from '../lib/api'
import { seedSampleSet } from '../lib/seed'
import type { FlashSet } from '../types'
import { colorForLabel } from '../utils/colors'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

export function Dashboard() {
  const [sets, setSets] = useState<FlashSet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [seeding, setSeeding] = useState(false)
  const navigate = useNavigate()

  async function refresh() {
    setLoading(true)
    try {
      setSets(await listSets())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    sets.forEach((s) => s.category && set.add(s.category))
    return Array.from(set).sort()
  }, [sets])

  const visibleSets = useMemo(
    () =>
      categoryFilter === 'all'
        ? sets
        : sets.filter((s) => s.category === categoryFilter),
    [sets, categoryFilter],
  )

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and all its cards? This can't be undone.`))
      return
    await deleteSet(id)
    refresh()
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const set = await seedSampleSet()
      navigate(`/sets/${set.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed sample set')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-slate-900">My Sets</h1>
        <Button to="/sets/new" variant="green">
          + New Set
        </Button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border-[3px] border-black bg-rose-200 px-3 py-2 text-sm font-semibold text-rose-950">
          {error}
        </p>
      )}

      {categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${
              categoryFilter === 'all'
                ? 'border-black bg-slate-900 text-white'
                : 'border-black bg-white text-slate-800'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${
                categoryFilter === c
                  ? 'border-black bg-slate-900 text-white'
                  : colorForLabel(c)
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="font-medium text-slate-600">Loading…</p>
      ) : visibleSets.length === 0 ? (
        <Panel dashed flat className="bg-white p-10 text-center">
          <p className="mb-4 font-medium text-slate-700">
            No flashcard sets yet. Create your first one, or try a sample set
            to see the format.
          </p>
          <div className="flex justify-center gap-3">
            <Button to="/sets/new" variant="green">
              + New Set
            </Button>
            <Button onClick={handleSeed} disabled={seeding} variant="yellow">
              {seeding ? 'Adding sample…' : 'Add a sample set (Latin)'}
            </Button>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSets.map((set) => (
            <Panel key={set.id} className="flex flex-col justify-between bg-white p-4">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {set.category && (
                    <span
                      className={`rounded-full border-2 px-2 py-0.5 text-xs font-bold ${colorForLabel(
                        set.category,
                      )}`}
                    >
                      {set.category}
                    </span>
                  )}
                  {set.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border-2 border-black bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {set.name}
                </h2>
                {set.description && (
                  <p className="mt-1 text-sm text-slate-600">
                    {set.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button to={`/study?sets=${set.id}`} variant="green" size="sm">
                  Study
                </Button>
                <Button to={`/sets/${set.id}`} variant="blue" size="sm">
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(set.id, set.name)}
                  variant="red"
                  size="sm"
                >
                  Delete
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
