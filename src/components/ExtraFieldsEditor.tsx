import { useState } from 'react'
import type { ExtraFieldDef } from '../types'
import { Button } from './ui/Button'

export function ExtraFieldsEditor({
  fields,
  onChange,
}: {
  fields: ExtraFieldDef[]
  onChange: (fields: ExtraFieldDef[]) => void
}) {
  const [newLabel, setNewLabel] = useState('')

  function addField() {
    const label = newLabel.trim()
    if (!label) return
    const key = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    if (!key || fields.some((f) => f.key === key)) return
    onChange([...fields, { key, label }])
    setNewLabel('')
  }

  function removeField(key: string) {
    onChange(fields.filter((f) => f.key !== key))
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-800">
        Extra fields (optional)
      </label>
      <p className="mb-2 text-xs font-medium text-slate-600">
        Add labeled fields that show on the back of every card in this set —
        e.g. "Gender", "Formula", "Principal parts", "Date".
      </p>
      {fields.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {fields.map((f) => (
            <li
              key={f.key}
              className="flex items-center gap-1 rounded-full border-2 border-black bg-lime-200 px-3 py-1 text-sm font-bold"
            >
              {f.label}
              <button
                type="button"
                onClick={() => removeField(f.key)}
                className="text-slate-700 hover:text-red-700"
                aria-label={`Remove ${f.label}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addField()
            }
          }}
          placeholder="Field label, e.g. Gender"
          className="flex-1 rounded-lg border-[3px] border-black bg-white px-3 py-1.5 text-sm font-medium"
        />
        <Button type="button" onClick={addField} variant="blue" size="sm">
          Add field
        </Button>
      </div>
    </div>
  )
}
