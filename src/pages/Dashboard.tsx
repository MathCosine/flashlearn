import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  deleteSet,
  duplicateSet,
  listAllProgress,
  listCardIndex,
  listCards,
  listRecentSessions,
  listSets,
  type SetWithCount,
} from '../lib/api'
import { seedSampleSets } from '../lib/seed'
import type { CardProgress, StudySessionLog } from '../types'
import { computeStreak, studiedToday } from '../utils/streak'
import { colorForLabel } from '../utils/colors'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Stat } from '../components/ui/Stat'
import { Input } from '../components/ui/Field'
import { SetCard } from '../components/SetCard'

type SortKey = 'recent' | 'name' | 'size'

export function Dashboard() {
  const [sets, setSets] = useState<SetWithCount[]>([])
  const [progress, setProgress] = useState<CardProgress[]>([])
  const [cardPairs, setCardPairs] = useState<{ id: string; set_id: string }[]>(
    [],
  )
  const [sessions, setSessions] = useState<StudySessionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function refresh() {
    setLoading(true)
    try {
      const [loadedSets, loadedProgress, loadedPairs, loadedSessions] =
        await Promise.all([
          listSets(),
          listAllProgress(),
          listCardIndex(),
          listRecentSessions(200),
        ])
      setSets(loadedSets)
      setProgress(loadedProgress)
      setCardPairs(loadedPairs)
      setSessions(loadedSessions)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your sets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const knownCardIds = useMemo(
    () => new Set(progress.filter((p) => p.known).map((p) => p.card_id)),
    [progress],
  )

  /** How many cards in each set the learner has marked as known. */
  const masteredBySet = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const pair of cardPairs) {
      if (knownCardIds.has(pair.id)) {
        counts[pair.set_id] = (counts[pair.set_id] ?? 0) + 1
      }
    }
    return counts
  }, [cardPairs, knownCardIds])

  const categories = useMemo(() => {
    const found = new Set<string>()
    sets.forEach((s) => s.category && found.add(s.category))
    return Array.from(found).sort()
  }, [sets])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = sets.filter((s) => {
      const matchesCategory = category === 'all' || s.category === category
      const matchesQuery =
        !term ||
        s.name.toLowerCase().includes(term) ||
        (s.description ?? '').toLowerCase().includes(term) ||
        s.tags.some((t) => t.toLowerCase().includes(term))
      return matchesCategory && matchesQuery
    })

    return [...filtered].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'size') return b.card_count - a.card_count
      return b.created_at.localeCompare(a.created_at)
    })
  }, [sets, category, query, sort])

  const totals = useMemo(() => {
    const cards = sets.reduce((sum, s) => sum + s.card_count, 0)
    return {
      sets: sets.length,
      cards,
      known: knownCardIds.size,
      streak: computeStreak(sessions),
    }
  }, [sets, knownCardIds, sessions])

  async function handleDelete(set: SetWithCount) {
    if (
      !confirm(
        `Delete "${set.name}" and its ${set.card_count} card(s)? This can't be undone.`,
      )
    )
      return
    try {
      await deleteSet(set.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete set')
    }
  }

  async function handleDuplicate(set: SetWithCount) {
    setBusy(true)
    try {
      await duplicateSet(set.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate set')
    } finally {
      setBusy(false)
    }
  }

  /** Downloads the set as pipe-separated text the importer can read back. */
  async function handleExport(set: SetWithCount) {
    try {
      const cards = await listCards(set.id)
      const lines = cards.map((c) =>
        [
          c.front,
          c.back,
          ...set.extra_fields.map((f) => c.extra_data[f.key] ?? ''),
        ].join(' | '),
      )
      const blob = new Blob([lines.join('\n')], {
        type: 'text/plain;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${set.name.replace(/[^\w-]+/g, '-')}.txt`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export set')
    }
  }

  async function handleSeed() {
    setBusy(true)
    try {
      await seedSampleSets()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add samples')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <p className="font-medium text-stone-600">Loading your sets…</p>
  }

  return (
    <div>
      <PageHeader
        title="My sets"
        description={
          totals.streak > 0
            ? `${totals.streak} day streak${studiedToday(sessions) ? '' : ' — study today to keep it'}`
            : 'Build a set, then drill it however you like.'
        }
        actions={
          <>
            <Button to="/study" variant="blue">
              Study
            </Button>
            <Button to="/sets/new" variant="green">
              New set
            </Button>
          </>
        }
      />

      {error && (
        <Panel className="mb-4 bg-rose-200 px-4 py-2">
          <p className="text-sm font-semibold text-rose-950">{error}</p>
        </Panel>
      )}

      {sets.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Sets" value={totals.sets} />
          <Stat label="Cards" value={totals.cards} />
          <Stat
            label="Known"
            value={totals.known}
            sub={
              totals.cards > 0
                ? `${Math.round((totals.known / totals.cards) * 100)}% of all cards`
                : undefined
            }
            tone="bg-emerald-200"
          />
          <Stat
            label="Day streak"
            value={totals.streak}
            tone={totals.streak > 0 ? 'bg-amber-200' : 'bg-white'}
          />
        </div>
      )}

      {sets.length === 0 ? (
        <Panel dashed flat className="bg-white p-12 text-center">
          <h2 className="text-xl font-bold text-ink">No sets yet</h2>
          <p className="mx-auto mt-2 max-w-md font-medium text-stone-600">
            Create a set and add cards by hand, or paste a whole vocabulary
            list at once. Not sure where to start? Load a couple of samples.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button to="/sets/new" variant="green" size="lg">
              Create a set
            </Button>
            <Button onClick={handleSeed} disabled={busy} variant="yellow" size="lg">
              {busy ? 'Adding…' : 'Load sample sets'}
            </Button>
          </div>
        </Panel>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sets…"
              className="max-w-xs"
            />
            <div className="flex flex-wrap gap-1.5">
              <Badge active={category === 'all'} onClick={() => setCategory('all')}>
                All
              </Badge>
              {categories.map((c) => (
                <Badge
                  key={c}
                  active={category === c}
                  onClick={() => setCategory(c)}
                  className={colorForLabel(c)}
                >
                  {c}
                </Badge>
              ))}
            </div>
            <div className="ml-auto flex gap-1.5">
              {(['recent', 'name', 'size'] as SortKey[]).map((key) => (
                <Badge
                  key={key}
                  active={sort === key}
                  onClick={() => setSort(key)}
                >
                  {key === 'recent' ? 'Newest' : key === 'name' ? 'A–Z' : 'Biggest'}
                </Badge>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <Panel dashed flat className="bg-white p-10 text-center">
              <p className="font-medium text-stone-600">
                No sets match that search.
              </p>
            </Panel>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  masteredCount={masteredBySet[set.id] ?? 0}
                  onDelete={() => handleDelete(set)}
                  onDuplicate={() => handleDuplicate(set)}
                  onExport={() => handleExport(set)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {sets.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/stats')} variant="neutral">
            See detailed progress
          </Button>
        </div>
      )}
    </div>
  )
}
