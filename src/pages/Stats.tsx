import { useEffect, useMemo, useState } from 'react'
import {
  listAllProgress,
  listCardIndex,
  listRecentSessions,
  listSets,
  type CardIndexEntry,
  type SetWithCount,
} from '../lib/api'
import type { CardProgress, StudySessionLog } from '../types'
import { studyModeById } from '../types'
import { computeStreak } from '../utils/streak'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Stat } from '../components/ui/Stat'
import { Progress } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function Stats() {
  const [sets, setSets] = useState<SetWithCount[]>([])
  const [progress, setProgress] = useState<CardProgress[]>([])
  const [cards, setCards] = useState<CardIndexEntry[]>([])
  const [sessions, setSessions] = useState<StudySessionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      listSets(),
      listAllProgress(),
      listCardIndex(),
      listRecentSessions(200),
    ])
      .then(([s, p, c, sess]) => {
        setSets(s)
        setProgress(p)
        setCards(c)
        setSessions(sess)
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load stats'),
      )
      .finally(() => setLoading(false))
  }, [])

  const progressByCard = useMemo(() => {
    const map: Record<string, CardProgress> = {}
    progress.forEach((p) => {
      map[p.card_id] = p
    })
    return map
  }, [progress])

  const totals = useMemo(() => {
    const totalCards = cards.length
    const known = progress.filter((p) => p.known).length
    const starred = progress.filter((p) => p.starred).length
    const answered = progress.reduce((sum, p) => sum + p.times_seen, 0)
    const correct = progress.reduce((sum, p) => sum + p.times_correct, 0)
    return {
      totalCards,
      known,
      starred,
      answered,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      streak: computeStreak(sessions),
      sessions: sessions.length,
    }
  }, [cards, progress, sessions])

  /** Per-set completion, sorted so the least-finished sets surface first. */
  const bySet = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const card of cards) {
      if (progressByCard[card.id]?.known) {
        counts[card.set_id] = (counts[card.set_id] ?? 0) + 1
      }
    }
    return sets
      .filter((s) => s.card_count > 0)
      .map((s) => ({
        set: s,
        known: counts[s.id] ?? 0,
        pct: Math.round(((counts[s.id] ?? 0) / s.card_count) * 100),
      }))
      .sort((a, b) => a.pct - b.pct)
  }, [sets, cards, progressByCard])

  /** The cards that have collected the most dots — the ones to review. */
  const stubborn = useMemo(() => {
    return cards
      .map((card) => ({ card, dots: progressByCard[card.id]?.dots ?? 0 }))
      .filter((row) => row.dots > 0)
      .sort((a, b) => b.dots - a.dots)
      .slice(0, 10)
  }, [cards, progressByCard])

  const maxDots = stubborn[0]?.dots ?? 1

  if (loading) {
    return <p className="font-medium text-stone-600">Loading progress…</p>
  }

  if (error) {
    return (
      <Panel className="bg-rose-200 px-4 py-3">
        <p className="font-semibold text-rose-950">{error}</p>
      </Panel>
    )
  }

  return (
    <div>
      <PageHeader
        title="Progress"
        description="What you've learned so far, and what still needs work."
        actions={<Button to="/study" variant="green">Study now</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          label="Day streak"
          value={totals.streak}
          sub={totals.streak === 1 ? 'day in a row' : 'days in a row'}
          tone={totals.streak > 0 ? 'bg-amber-200' : 'bg-white'}
        />
        <Stat
          label="Cards known"
          value={totals.known}
          sub={`of ${totals.totalCards}`}
          tone="bg-emerald-200"
        />
        <Stat
          label="Accuracy"
          value={`${totals.accuracy}%`}
          sub={`across ${totals.answered} answers`}
        />
        <Stat
          label="Sessions"
          value={totals.sessions}
          sub={totals.starred > 0 ? `${totals.starred} cards starred` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel className="bg-white p-5">
          <h2 className="mb-1 text-lg font-bold text-ink">Sets by progress</h2>
          <p className="mb-4 text-sm font-medium text-stone-500">
            Least finished first.
          </p>
          {bySet.length === 0 ? (
            <p className="font-medium text-stone-500">
              No cards yet — add some and they'll show up here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {bySet.map(({ set, known, pct }) => (
                <div key={set.id}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold text-ink">
                      {set.name}
                    </span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-stone-600">
                      {known}/{set.card_count}
                      <span className="ml-1.5 text-stone-400">{pct}%</span>
                    </span>
                  </div>
                  <Progress
                    value={known}
                    max={set.card_count}
                    height="h-2.5"
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel className="bg-white p-5">
          <h2 className="mb-1 text-lg font-bold text-ink">Stubborn cards</h2>
          <p className="mb-4 text-sm font-medium text-stone-500">
            The cards that have collected the most dots.
          </p>
          {stubborn.length === 0 ? (
            <p className="font-medium text-stone-500">
              No dots yet. Run the Dot Method and the tricky cards will
              collect them.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {stubborn.map(({ card, dots }) => (
                <div key={card.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate font-semibold text-ink">
                    {card.front}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full border-2 border-black bg-white">
                    <div
                      className="h-full bg-rose-400"
                      style={{ width: `${(dots / maxDots) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-stone-600">
                    {dots}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel className="mt-5 bg-white p-5">
        <h2 className="mb-4 text-lg font-bold text-ink">Recent sessions</h2>
        {sessions.length === 0 ? (
          <p className="font-medium text-stone-500">
            Nothing yet — finish a study session and it'll be logged here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.slice(0, 12).map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-black bg-stone-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Badge className="bg-white">
                    {formatDate(session.created_at)}
                  </Badge>
                  <span className="font-semibold text-ink">
                    {studyModeById(session.mode)?.name ?? session.mode}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-stone-600">
                  {/* Flip is review-only, so it has no correctness to show. */}
                  {session.mode === 'flip'
                    ? `${session.cards_studied} reviewed`
                    : `${session.cards_correct}/${session.cards_studied} correct`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
