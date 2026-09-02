import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  getSets,
  listCardsForSets,
  listProgressForCards,
  logStudySession,
  upsertProgress,
} from '../lib/api'
import type {
  CardProgress,
  Direction,
  FlashSet,
  PoolFilter,
  RecordOptions,
  SessionResult,
  StudyItem,
  StudyMode,
  StudyOptions,
} from '../types'
import { studyModeById } from '../types'
import { buildStudyItems } from '../utils/studyPool'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'
import { Badge } from '../components/ui/Badge'
import { ClassicFlip } from './study/ClassicFlip'
import { StackMethod } from './study/StackMethod'
import { DotMethod } from './study/DotMethod'
import { SpeedRound } from './study/SpeedRound'
import { MultipleChoice } from './study/MultipleChoice'
import { TypeAnswer } from './study/TypeAnswer'
import { MatchGame } from './study/MatchGame'
import { TrueFalse } from './study/TrueFalse'
import { LearnMode } from './study/LearnMode'

const POOL_LABELS: Record<PoolFilter, string> = {
  all: 'All cards',
  unknown: 'Not yet known',
  starred: 'Starred only',
  stubborn: '3+ dots only',
}

const DIRECTION_LABELS: Record<Direction, string> = {
  front: 'Front → Back',
  back: 'Back → Front',
  mixed: 'Mixed directions',
}

export function StudySession() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  // Memoize on the raw query string: useSearchParams hands back a fresh
  // URLSearchParams object each render, which would otherwise re-trigger
  // the loading effect forever.
  const search = params.toString()
  const { setIds, mode, options } = useMemo(() => {
    const q = new URLSearchParams(search)
    return {
      setIds: (q.get('sets') ?? '').split(',').filter(Boolean),
      mode: (q.get('mode') ?? 'flip') as StudyMode,
      options: {
        direction: (q.get('dir') ?? 'front') as Direction,
        pool: (q.get('pool') ?? 'all') as PoolFilter,
        shuffle: q.get('shuffle') !== '0',
        limit: Number(q.get('limit') ?? 0) || 0,
      } satisfies StudyOptions,
    }
  }, [search])

  const [sets, setSets] = useState<FlashSet[]>([])
  const [items, setItems] = useState<StudyItem[]>([])
  const [progressByCard, setProgressByCard] = useState<
    Record<string, CardProgress>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [runKey, setRunKey] = useState(0)

  // Keeps `record` reading the freshest progress without re-creating it.
  // Updated after commit rather than during render, since a render can be
  // thrown away.
  const progressRef = useRef(progressByCard)
  useEffect(() => {
    progressRef.current = progressByCard
  }, [progressByCard])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const [loadedSets, cards] = await Promise.all([
          getSets(setIds),
          listCardsForSets(setIds),
        ])
        const progressRows = await listProgressForCards(cards.map((c) => c.id))
        if (!active) return

        const byCard: Record<string, CardProgress> = {}
        progressRows.forEach((p) => {
          byCard[p.card_id] = p
        })

        setSets(loadedSets)
        setProgressByCard(byCard)
        setItems(buildStudyItems(cards, options, byCard))
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load cards')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [setIds, options, runKey])

  const setById = useMemo(
    () => new Map(sets.map((s) => [s.id, s])),
    [sets],
  )

  /**
   * Single place where a mode's answer turns into saved progress, so each
   * mode only has to say "this card was right/wrong".
   */
  const record = useCallback((cardId: string, opts: RecordOptions) => {
    const existing = progressRef.current[cardId]
    // Toggling a star isn't a review, so it shouldn't inflate the counts.
    const starOnly =
      opts.starred !== undefined && opts.correct === undefined && !opts.addDot

    const next: CardProgress = {
      id: existing?.id ?? '',
      user_id: existing?.user_id ?? '',
      card_id: cardId,
      dots: (existing?.dots ?? 0) + (opts.addDot ? 1 : 0),
      known:
        opts.correct === undefined ? (existing?.known ?? false) : opts.correct,
      starred: opts.starred ?? existing?.starred ?? false,
      times_seen: (existing?.times_seen ?? 0) + (starOnly ? 0 : 1),
      times_correct: (existing?.times_correct ?? 0) + (opts.correct ? 1 : 0),
      last_reviewed: new Date().toISOString(),
    }

    setProgressByCard((prev) => ({ ...prev, [cardId]: next }))

    // Fire and forget: a dropped write costs one card's stats, not the session.
    void upsertProgress({
      card_id: cardId,
      dots: next.dots,
      known: next.known,
      starred: next.starred,
      times_seen: next.times_seen,
      times_correct: next.times_correct,
    }).catch(() => {})
  }, [])

  const onFinish = useCallback(
    (result: SessionResult) => {
      void logStudySession({
        mode,
        cards_studied: result.studied,
        cards_correct: result.correct,
      }).catch(() => {})
    },
    [mode],
  )

  const meta = studyModeById(mode)

  if (loading) {
    return <p className="font-medium text-stone-600">Loading cards…</p>
  }

  if (error) {
    return (
      <Panel className="mx-auto max-w-md bg-rose-200 p-6 text-center">
        <p className="font-semibold text-rose-950">{error}</p>
        <Button to="/study" variant="neutral" className="mt-4">
          Back to setup
        </Button>
      </Panel>
    )
  }

  if (setIds.length === 0 || items.length === 0) {
    return (
      <Panel dashed flat className="mx-auto max-w-lg bg-white p-8 text-center">
        <p className="text-lg font-bold text-ink">Nothing to study here</p>
        <p className="mt-2 font-medium text-stone-600">
          {setIds.length === 0
            ? 'No sets were selected for this session.'
            : `No cards matched the "${POOL_LABELS[options.pool]}" filter. Try widening it.`}
        </p>
        <Button to="/study" variant="green" className="mt-4">
          Choose sets
        </Button>
      </Panel>
    )
  }

  const modeProps = {
    items,
    setById,
    progressByCard,
    record,
    onFinish,
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{meta?.name ?? 'Study'}</h1>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Badge className="bg-white">{items.length} cards</Badge>
            <Badge className="bg-white">
              {DIRECTION_LABELS[options.direction]}
            </Badge>
            {options.pool !== 'all' && (
              <Badge className="bg-amber-200 text-amber-950">
                {POOL_LABELS[options.pool]}
              </Badge>
            )}
            {sets.length > 1 && (
              <Badge className="bg-sky-200 text-sky-950">
                {sets.length} sets mixed
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setRunKey((k) => k + 1)}
            variant="neutral"
            size="sm"
          >
            Reshuffle
          </Button>
          <Button onClick={() => navigate('/study')} variant="neutral" size="sm">
            Exit
          </Button>
        </div>
      </div>

      <div key={`${mode}-${runKey}`}>
        {mode === 'flip' && <ClassicFlip {...modeProps} />}
        {mode === 'stack' && <StackMethod {...modeProps} />}
        {mode === 'dots' && <DotMethod {...modeProps} />}
        {mode === 'speed' && <SpeedRound {...modeProps} />}
        {mode === 'choice' && <MultipleChoice {...modeProps} />}
        {mode === 'type' && <TypeAnswer {...modeProps} />}
        {mode === 'match' && <MatchGame {...modeProps} />}
        {mode === 'truefalse' && <TrueFalse {...modeProps} />}
        {mode === 'learn' && <LearnMode {...modeProps} />}
      </div>
    </div>
  )
}
