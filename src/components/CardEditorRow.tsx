import { useState } from 'react'
import type { ExtraFieldDef, FlashCard } from '../types'
import { Button } from './ui/Button'

export function CardEditorRow({
  card,
  extraFields,
  onSave,
  onDelete,
}: {
  card: FlashCard
  extraFields: ExtraFieldDef[]
  onSave: (patch: {
    front: string
    back: string
    extra_data: Record<string, string>
  }) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [extra, setExtra] = useState<Record<string, string>>(card.extra_data)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({ front, back, extra_data: extra })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border-[3px] border-black bg-white p-3">
        <div>
          <p className="font-extrabold text-slate-900">{card.front}</p>
          <p className="text-sm text-slate-700">{card.back}</p>
          {extraFields.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-x-3 text-xs font-medium text-slate-500">
              {extraFields.map((f) =>
                card.extra_data[f.key] ? (
                  <span key={f.key}>
                    {f.label}: {card.extra_data[f.key]}
                  </span>
                ) : null,
              )}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button onClick={() => setEditing(true)} variant="blue" size="sm">
            Edit
          </Button>
          <Button onClick={onDelete} variant="red" size="sm">
            Delete
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-[3px] border-black bg-yellow-100 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front"
          className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 font-medium"
        />
        <input
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back"
          className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 font-medium"
        />
      </div>
      {extraFields.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {extraFields.map((f) => (
            <input
              key={f.key}
              value={extra[f.key] ?? ''}
              onChange={(e) =>
                setExtra((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              placeholder={f.label}
              className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 text-sm font-medium"
            />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} variant="green" size="sm">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button onClick={() => setEditing(false)} variant="neutral" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  )
}
