import { useEffect } from 'react'
import { Panel } from './ui/Panel'
import { Button } from './ui/Button'
import { Progress } from './ui/Progress'
import { sounds } from '../lib/sound'

export function SessionSummary({
  title,
  studied,
  correct,
  extra,
  onRestart,
}: {
  title: string
  studied: number
  correct: number
  extra?: string
  onRestart: () => void
}) {
  useEffect(() => {
    sounds.finish()
  }, [])

  const pct = studied > 0 ? Math.round((correct / studied) * 100) : 0
  const message =
    pct >= 90
      ? 'Excellent recall.'
      : pct >= 70
        ? 'Solid. A few more passes will lock it in.'
        : pct >= 40
          ? 'Getting there — run it again.'
          : 'Early days. Repetition is the whole trick.'

  return (
    <Panel raised className="mx-auto max-w-md bg-emerald-200 p-8 text-center">
      <p className="text-2xl font-bold text-ink">{title}</p>
      <p className="mt-4 text-5xl font-bold tabular-nums text-ink">
        {correct}
        <span className="text-2xl text-stone-600"> / {studied}</span>
      </p>
      <Progress value={correct} max={studied} className="mt-4" />
      <p className="mt-3 font-semibold text-ink">{pct}% correct</p>
      <p className="mt-1 text-sm font-medium text-stone-700">
        {extra ?? message}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Button onClick={onRestart} variant="green">
          Go again
        </Button>
        <Button to="/study" variant="neutral">
          Change mode
        </Button>
      </div>
    </Panel>
  )
}
