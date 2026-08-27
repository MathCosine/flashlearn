import { useState } from 'react'
import type { ExtraFieldDef } from '../types'
import { Button } from './ui/Button'

export function BulkImport({
  extraFields,
  onImport,
}: {
  extraFields: ExtraFieldDef[]
  onImport: (
    rows: { front: string; back: string; extra_data: Record<string, string> }[],
  ) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const columns = ['Front', 'Back', ...extraFields.map((f) => f.label)]

  async function handleImport() {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const rows = lines.map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      const [front = '', back = '', ...rest] = parts
      const extra_data: Record<string, string> = {}
      extraFields.forEach((f, i) => {
        if (rest[i]) extra_data[f.key] = rest[i]
      })
      return { front, back, extra_data }
    })
    const valid = rows.filter((r) => r.front && r.back)
    if (valid.length === 0) {
      setMessage('No valid rows found. Each line needs at least a front and back separated by "|".')
      return
    }
    setBusy(true)
    try {
      await onImport(valid)
      setMessage(`Imported ${valid.length} card${valid.length === 1 ? '' : 's'}.`)
      setText('')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-bold text-slate-800 underline decoration-2 underline-offset-2"
      >
        Bulk import cards from text
      </button>
    )
  }

  return (
    <div className="rounded-xl border-[3px] border-black bg-yellow-100 p-4">
      <p className="mb-2 text-sm font-medium text-slate-700">
        One card per line, fields separated by <code>|</code>:
        <br />
        <code className="text-xs font-bold">{columns.join(' | ')}</code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={`agricola | farmer${extraFields.length ? ' | ...' : ''}\npuella | girl${extraFields.length ? ' | ...' : ''}`}
        className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 font-mono text-sm"
      />
      {message && (
        <p className="mt-2 text-sm font-bold text-emerald-800">{message}</p>
      )}
      <div className="mt-2 flex gap-2">
        <Button onClick={handleImport} disabled={busy || !text.trim()} variant="green" size="sm">
          {busy ? 'Importing…' : 'Import'}
        </Button>
        <Button onClick={() => setOpen(false)} variant="neutral" size="sm">
          Close
        </Button>
      </div>
    </div>
  )
}
