import { useMemo, useRef, useState } from 'react'
import type { ExtraFieldDef } from '../types'
import {
  DELIMITER_LABELS,
  detectDelimiter,
  parseImport,
  type Delimiter,
} from '../utils/parseImport'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Textarea } from './ui/Field'
import { Modal } from './ui/Modal'

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
  const [delimiter, setDelimiter] = useState<Delimiter>('auto')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const rows = useMemo(
    () => parseImport(text, delimiter, extraFields),
    [text, delimiter, extraFields],
  )
  const detected = useMemo(
    () => (text.trim() ? detectDelimiter(text) : null),
    [text],
  )
  const lineCount = text.split('\n').filter((l) => l.trim()).length
  const skipped = lineCount - rows.length

  async function handleFile(file: File) {
    setText(await file.text())
    setMessage(null)
  }

  async function handleImport() {
    if (rows.length === 0) return
    setBusy(true)
    try {
      await onImport(rows)
      setMessage(`Added ${rows.length} card${rows.length === 1 ? '' : 's'}.`)
      setText('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="yellow" size="sm">
        Import cards
      </Button>

      <Modal
        open={open}
        title="Import cards"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="neutral" size="sm">
              Close
            </Button>
            <Button
              onClick={handleImport}
              disabled={busy || rows.length === 0}
              variant="green"
              size="sm"
            >
              {busy ? 'Importing…' : `Add ${rows.length} card${rows.length === 1 ? '' : 's'}`}
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm font-medium text-stone-600">
          Paste one card per line — copy straight out of a spreadsheet, or type
          them with any separator. Columns are read in this order:{' '}
          <span className="font-bold text-ink">
            {['Front', 'Back', ...extraFields.map((f) => f.label)].join(' · ')}
          </span>
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {(Object.keys(DELIMITER_LABELS) as Delimiter[]).map((d) => (
            <Badge
              key={d}
              active={delimiter === d}
              onClick={() => setDelimiter(d)}
            >
              {d === 'auto' && detected ? `Auto (${detected})` : DELIMITER_LABELS[d].split(' ')[0]}
            </Badge>
          ))}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'agricola\tfarmer\nequus\thorse'}
          className="font-mono text-sm"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.csv,.tsv,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
              e.target.value = ''
            }}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            variant="neutral"
            size="sm"
          >
            Load a file
          </Button>
          {text && (
            <Button onClick={() => setText('')} variant="ghost" size="sm">
              Clear
            </Button>
          )}
        </div>

        {message && (
          <p className="mt-3 text-sm font-bold text-emerald-800">{message}</p>
        )}

        {rows.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-bold text-ink">
              Preview · {rows.length} card{rows.length === 1 ? '' : 's'}
              {skipped > 0 && (
                <span className="font-medium text-stone-500">
                  {' '}
                  ({skipped} line{skipped === 1 ? '' : 's'} skipped — need two
                  columns)
                </span>
              )}
            </p>
            <div className="max-h-48 overflow-auto rounded-xl border-[3px] border-black">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-amber-200">
                  <tr>
                    <th className="px-2 py-1 font-bold">Front</th>
                    <th className="px-2 py-1 font-bold">Back</th>
                    {extraFields.map((f) => (
                      <th key={f.key} className="px-2 py-1 font-bold">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 40).map((row, i) => (
                    <tr key={i} className="border-t border-black/20 bg-white">
                      <td className="px-2 py-1 font-medium">{row.front}</td>
                      <td className="px-2 py-1">{row.back}</td>
                      {extraFields.map((f) => (
                        <td key={f.key} className="px-2 py-1 text-stone-600">
                          {row.extra_data[f.key] ?? ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
