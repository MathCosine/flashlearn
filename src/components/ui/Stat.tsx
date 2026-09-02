import type { ReactNode } from 'react'
import { Panel } from './Panel'

/**
 * A single headline number with its label. Kept deliberately plain: the
 * number carries the meaning, the panel gives it the app's frame.
 */
export function Stat({
  label,
  value,
  sub,
  tone = 'bg-white',
}: {
  label: string
  value: ReactNode
  sub?: string
  tone?: string
}) {
  return (
    <Panel className={`${tone} px-4 py-3`}>
      <p className="text-xs font-bold uppercase tracking-wide text-stone-600">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-ink">{value}</p>
      {sub && <p className="text-xs font-medium text-stone-500">{sub}</p>}
    </Panel>
  )
}
