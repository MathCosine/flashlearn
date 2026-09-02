import { type FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  bulkCreateCards,
  createCard,
  createSet,
  deleteCard,
  getSet,
  listCards,
  updateCard,
  updateSet,
  uploadCardImage,
} from '../lib/api'
import type { ExtraFieldDef, FlashCard } from '../types'
import { ExtraFieldsEditor } from '../components/ExtraFieldsEditor'
import { BulkImport } from '../components/BulkImport'
import { CardEditorRow } from '../components/CardEditorRow'
import { MacronBar, insertAtCaret } from '../components/MacronBar'
import { CardImage } from '../components/CardImage'
import { PageHeader } from '../components/ui/PageHeader'
import { Panel } from '../components/ui/Panel'
import { Button } from '../components/ui/Button'
import { Field, Input, Checkbox } from '../components/ui/Field'

export function SetEditor() {
  const { id } = useParams<{ id: string }>()
  const isNew = !id
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [extraFields, setExtraFields] = useState<ExtraFieldDef[]>([])
  const [strictAnswers, setStrictAnswers] = useState(false)
  const [cards, setCards] = useState<FlashCard[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack] = useState('')
  const [newExtra, setNewExtra] = useState<Record<string, string>>({})
  const [newImage, setNewImage] = useState<string | null>(null)
  const [addingCard, setAddingCard] = useState(false)
  const [uploading, setUploading] = useState(false)

  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)
  const lastFocused = useRef<'front' | 'back'>('front')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew || !id) return
    let active = true
    ;(async () => {
      try {
        const [set, cardList] = await Promise.all([getSet(id), listCards(id)])
        if (!active) return
        setName(set.name)
        setDescription(set.description ?? '')
        setCategory(set.category ?? '')
        setTagsInput(set.tags.join(', '))
        setExtraFields(set.extra_fields)
        setStrictAnswers(set.strict_answers)
        setCards(cardList)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load set')
        }
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isNew])

  function parseTags(): string[] {
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (isNew) {
        const set = await createSet({
          name,
          description: description || undefined,
          category: category || undefined,
          tags: parseTags(),
          extra_fields: extraFields,
          strict_answers: strictAnswers,
        })
        navigate(`/sets/${set.id}`)
      } else if (id) {
        await updateSet(id, {
          name,
          description: description || null,
          category: category || null,
          tags: parseTags(),
          extra_fields: extraFields,
          strict_answers: strictAnswers,
        })
        setSaved(true)
        window.setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save set')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddCard(e: FormEvent) {
    e.preventDefault()
    if (!id || !newFront.trim() || !newBack.trim()) return
    setAddingCard(true)
    try {
      const card = await createCard({
        set_id: id,
        front: newFront.trim(),
        back: newBack.trim(),
        extra_data: newExtra,
        image_url: newImage,
      })
      setCards((prev) => [...prev, card])
      setNewFront('')
      setNewBack('')
      setNewExtra({})
      setNewImage(null)
      frontRef.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setAddingCard(false)
    }
  }

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      setNewImage(await uploadCardImage(file))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <p className="font-medium text-stone-600">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isNew ? 'New set' : name || 'Edit set'}
        description={
          isNew
            ? 'Give the set a name, then add cards on the next screen.'
            : `${cards.length} card${cards.length === 1 ? '' : 's'}`
        }
        actions={
          !isNew && id ? (
            <>
              <Button to={`/study?sets=${id}`} variant="green">
                Study this set
              </Button>
              <Button to="/" variant="neutral">
                Done
              </Button>
            </>
          ) : undefined
        }
      />

      {error && (
        <Panel className="bg-rose-200 px-4 py-2">
          <p className="text-sm font-semibold text-rose-950">{error}</p>
        </Panel>
      )}

      <Panel className="bg-white p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Latin Chapter 3 vocabulary"
            />
          </Field>

          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" hint="Groups sets on your dashboard.">
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Latin, Chemistry, Spanish…"
              />
            </Field>
            <Field label="Tags" hint="Comma separated.">
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="chapter 3, verbs"
              />
            </Field>
          </div>

          <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />

          <Checkbox
            label="Strict answer checking in typing modes (case and accents must match exactly)"
            checked={strictAnswers}
            onChange={(e) => setStrictAnswers(e.target.checked)}
          />

          <div className="flex items-center gap-3">
            <Button type="submit" variant="green" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create set' : 'Save changes'}
            </Button>
            {saved && (
              <span className="text-sm font-bold text-emerald-700">Saved</span>
            )}
          </div>
        </form>
      </Panel>

      {!isNew && id && (
        <Panel className="bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-ink">
              Cards ({cards.length})
            </h2>
            <BulkImport
              extraFields={extraFields}
              onImport={async (rows) => {
                await bulkCreateCards(id, rows)
                setCards(await listCards(id))
              }}
            />
          </div>

          <form
            onSubmit={handleAddCard}
            className="mb-5 flex flex-col gap-2 rounded-xl border-[3px] border-dashed border-black bg-emerald-50 p-3"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                ref={frontRef}
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                onFocus={() => (lastFocused.current = 'front')}
                placeholder="Front (e.g. agricola)"
              />
              <Input
                ref={backRef}
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                onFocus={() => (lastFocused.current = 'back')}
                placeholder="Back (e.g. farmer)"
              />
            </div>

            {extraFields.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {extraFields.map((f) => (
                  <Input
                    key={f.key}
                    value={newExtra[f.key] ?? ''}
                    onChange={(e) =>
                      setNewExtra((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
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
                  insertAtCaret(backRef.current, char, setNewBack)
                } else {
                  insertAtCaret(frontRef.current, char, setNewFront)
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
              {newImage && <CardImage path={newImage} className="h-12 w-12" />}
              <Button
                type="button"
                onClick={() => fileRef.current?.click()}
                variant="neutral"
                size="sm"
                disabled={uploading}
              >
                {uploading ? 'Uploading…' : newImage ? 'Replace image' : 'Add image'}
              </Button>
              <Button
                type="submit"
                variant="green"
                size="sm"
                disabled={addingCard || !newFront.trim() || !newBack.trim()}
                className="ml-auto"
              >
                {addingCard ? 'Adding…' : 'Add card'}
              </Button>
            </div>

            <p className="text-xs font-medium text-stone-500">
              Tip: wrap math in dollar signs — <code>$x^2$</code> — and it
              renders as real math on the card.
            </p>
          </form>

          <div className="flex flex-col gap-2">
            {cards.length === 0 ? (
              <p className="py-4 text-center font-medium text-stone-500">
                No cards yet. Add one above, or use Import cards to paste a
                whole list.
              </p>
            ) : (
              cards.map((card) => (
                <CardEditorRow
                  key={card.id}
                  card={card}
                  extraFields={extraFields}
                  onSave={async (patch) => {
                    const updated = await updateCard(card.id, patch)
                    setCards((prev) =>
                      prev.map((c) => (c.id === card.id ? updated : c)),
                    )
                  }}
                  onDelete={async () => {
                    if (!confirm(`Delete card "${card.front}"?`)) return
                    await deleteCard(card.id)
                    setCards((prev) => prev.filter((c) => c.id !== card.id))
                  }}
                />
              ))
            )}
          </div>
        </Panel>
      )}
    </div>
  )
}
