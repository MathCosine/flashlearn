import { useRef, useState } from 'react'
import type { ExtraFieldDef, FlashCard } from '../types'
import { uploadCardImage } from '../lib/api'
import { MacronBar, insertAtCaret } from './MacronBar'
import { RichText } from './RichText'
import { CardImage } from './CardImage'
import { Button } from './ui/Button'
import { Input } from './ui/Field'

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
    image_url: string | null
  }) => Promise<void>
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [front, setFront] = useState(card.front)
  const [back, setBack] = useState(card.back)
  const [extra, setExtra] = useState<Record<string, string>>(card.extra_data)
  const [imageUrl, setImageUrl] = useState<string | null>(card.image_url)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)
  const lastFocused = useRef<'front' | 'back'>('front')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSave({ front, back, extra_data: extra, image_url: imageUrl })
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setError(null)
    try {
      setImageUrl(await uploadCardImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function cancel() {
    setFront(card.front)
    setBack(card.back)
    setExtra(card.extra_data)
    setImageUrl(card.image_url)
    setError(null)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-xl border-[3px] border-black bg-white p-3">
        <div className="flex min-w-0 items-start gap-3">
          {card.image_url && (
            <CardImage path={card.image_url} className="h-12 w-12 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-bold text-ink">
              <RichText text={card.front} />
            </p>
            <p className="text-sm text-stone-700">
              <RichText text={card.back} />
            </p>
            {extraFields.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-x-3 text-xs font-medium text-stone-500">
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
    <div className="flex flex-col gap-2 rounded-xl border-[3px] border-black bg-amber-100 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Input
          ref={frontRef}
          value={front}
          onChange={(e) => setFront(e.target.value)}
          onFocus={() => (lastFocused.current = 'front')}
          placeholder="Front"
        />
        <Input
          ref={backRef}
          value={back}
          onChange={(e) => setBack(e.target.value)}
          onFocus={() => (lastFocused.current = 'back')}
          placeholder="Back"
        />
      </div>

      {extraFields.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {extraFields.map((f) => (
            <Input
              key={f.key}
              value={extra[f.key] ?? ''}
              onChange={(e) =>
                setExtra((prev) => ({ ...prev, [f.key]: e.target.value }))
              }
              placeholder={f.label}
              className="text-sm"
            />
          ))}
        </div>
      )}

      <MacronBar
        onInsert={(char) => {
          if (lastFocused.current === 'back') {
            insertAtCaret(backRef.current, char, setBack)
          } else {
            insertAtCaret(frontRef.current, char, setFront)
          }
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleUpload(file)
            e.target.value = ''
          }}
        />
        {imageUrl && <CardImage path={imageUrl} className="h-12 w-12" />}
        <Button
          onClick={() => fileRef.current?.click()}
          variant="neutral"
          size="sm"
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Add image'}
        </Button>
        {imageUrl && (
          <Button onClick={() => setImageUrl(null)} variant="ghost" size="sm">
            Remove image
          </Button>
        )}
      </div>

      {error && <p className="text-sm font-semibold text-rose-700">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} variant="green" size="sm">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button onClick={cancel} variant="neutral" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  )
}
