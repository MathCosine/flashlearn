import { useState } from 'react'
import type { SetWithCount } from '../lib/api'
import { colorForLabel } from '../utils/colors'
import { Panel } from './ui/Panel'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Progress } from './ui/Progress'

export function SetCard({
  set,
  masteredCount,
  onDelete,
  onDuplicate,
  onExport,
}: {
  set: SetWithCount
  masteredCount: number
  onDelete: () => void
  onDuplicate: () => void
  onExport: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Panel className="flex flex-col justify-between bg-white p-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {set.category && (
            <Badge className={colorForLabel(set.category)}>
              {set.category}
            </Badge>
          )}
          {set.tags.slice(0, 2).map((t) => (
            <Badge key={t} className="bg-stone-100 text-stone-700">
              {t}
            </Badge>
          ))}
        </div>

        <h2 className="text-lg font-bold leading-snug text-ink">{set.name}</h2>
        {set.description && (
          <p className="mt-1 line-clamp-2 text-sm font-medium text-stone-600">
            {set.description}
          </p>
        )}

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs font-bold text-stone-500">
            <span>
              {set.card_count} card{set.card_count === 1 ? '' : 's'}
            </span>
            <span>
              {set.card_count > 0
                ? `${Math.round((masteredCount / set.card_count) * 100)}% known`
                : 'empty'}
            </span>
          </div>
          <Progress
            value={masteredCount}
            max={Math.max(set.card_count, 1)}
            height="h-2.5"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button to={`/study?sets=${set.id}`} variant="green" size="sm">
          Study
        </Button>
        <Button to={`/sets/${set.id}`} variant="blue" size="sm">
          Edit
        </Button>
        <div className="relative ml-auto">
          <Button
            onClick={() => setMenuOpen((o) => !o)}
            variant="neutral"
            size="sm"
            aria-label="More actions"
          >
            •••
          </Button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border-[3px] border-black bg-white shadow-hard-lg">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDuplicate()
                  }}
                  className="block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-stone-100"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onExport()
                  }}
                  className="block w-full px-3 py-2 text-left text-sm font-semibold hover:bg-stone-100"
                >
                  Export
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete()
                  }}
                  className="block w-full border-t-2 border-black px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}
