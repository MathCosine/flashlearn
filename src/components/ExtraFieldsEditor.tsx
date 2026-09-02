import { useState } from 'react'
import type { ExtraFieldDef } from '../types'
import { Button } from './ui/Button'
import { Input } from './ui/Field'

const PRESETS: Record<string, string[]> = {
  Latin: ['Full forms', 'Gender', 'Declension / Conjugation', 'Derivatives'],
  Science: ['Units', 'Note'],
  History: ['Date', 'Significance'],
}

export function ExtraFieldsEditor({
  fields,
  onChange,
}: {
  fields: ExtraFieldDef[]
  onChange: (fields: ExtraFieldDef[]) => void
}) {
  const [newLabel, setNewLabel] = useState('')

  function toKey(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  function addField(label: string) {
    const trimmed = label.trim()
    if (!trimmed) return
    const key = toKey(trimmed)
    if (!key || fields.some((f) => f.key === key)) return
    onChange([...fields, { key, label: trimmed }])
    setNewLabel('')
  }

  function applyPreset(preset: string) {
    const merged = [...fields]
    for (const label of PRESETS[preset]) {
      const key = toKey(label)
      if (!merged.some((f) => f.key === key)) merged.push({ key, label })
    }
    onChange(merged)
  }

  return (
    <div>
      <p className="mb-1 text-sm font-bold text-ink">
        Extra fields (optional)
      </p>
      <p className="mb-2 text-xs font-medium text-stone-500">
        Labeled fields that appear on the back of every card in this set — for
        example Gender, Principal parts, Units, or Date.
      </p>

      {fields.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {fields.map((f) => (
            <li
              key={f.key}
              className="flex items-center gap-1.5 rounded-full border-2 border-black bg-lime-200 px-3 py-1 text-sm font-bold"
            >
              {f.label}
              <button
                type="button"
                onClick={() => onChange(fields.filter((x) => x.key !== f.key))}
                className="text-stone-600 hover:text-rose-700"
                aria-label={`Remove ${f.label}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addField(newLabel)
            }
          }}
          placeholder="Field label, e.g. Gender"
          className="text-sm"
        />
        <Button
          type="button"
          onClick={() => addField(newLabel)}
          variant="blue"
          size="sm"
        >
          Add
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-500">Quick add:</span>
        {Object.keys(PRESETS).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-full border-2 border-black bg-white px-2.5 py-0.5 text-xs font-bold hover:bg-stone-100"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}
