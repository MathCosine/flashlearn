import { type FormEvent, useEffect, useState } from 'react'
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
} from '../lib/api'
import type { ExtraFieldDef, FlashCard } from '../types'
import { ExtraFieldsEditor } from '../components/ExtraFieldsEditor'
import { BulkImport } from '../components/BulkImport'
import { CardEditorRow } from '../components/CardEditorRow'
import { Button } from '../components/ui/Button'
import { Panel } from '../components/ui/Panel'

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
  const [error, setError] = useState<string | null>(null)

  const [newFront, setNewFront] = useState('')
  const [newBack, setNewBack] = useState('')
  const [newExtra, setNewExtra] = useState<Record<string, string>>({})
  const [addingCard, setAddingCard] = useState(false)

  useEffect(() => {
    if (isNew || !id) return
    ;(async () => {
      try {
        const [set, cardList] = await Promise.all([getSet(id), listCards(id)])
        setName(set.name)
        setDescription(set.description ?? '')
        setCategory(set.category ?? '')
        setTagsInput(set.tags.join(', '))
        setExtraFields(set.extra_fields)
        setStrictAnswers(set.strict_answers)
        setCards(cardList)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load set')
      } finally {
        setLoading(false)
      }
    })()
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
      })
      setCards((prev) => [...prev, card])
      setNewFront('')
      setNewBack('')
      setNewExtra({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add card')
    } finally {
      setAddingCard(false)
    }
  }

  if (loading) {
    return <p className="font-medium text-slate-600">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Panel className="bg-white p-5">
        <h1 className="mb-4 text-2xl font-extrabold text-slate-900">
          {isNew ? 'New Set' : 'Edit Set'}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Latin Chapter 3 Vocab"
              className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-slate-800">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Category
              </label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Latin, Chemistry, Spanish"
                className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">
                Tags (comma separated)
              </label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. chapter 3, verbs"
                className="w-full rounded-lg border-[3px] border-black bg-white px-3 py-2 font-medium"
              />
            </div>
          </div>

          <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />

          <label className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <input
              type="checkbox"
              checked={strictAnswers}
              onChange={(e) => setStrictAnswers(e.target.checked)}
              className="h-4 w-4"
            />
            Strict answer checking in Type mode (exact match, case & accents
            matter)
          </label>

          {error && (
            <p className="rounded-lg border-[3px] border-black bg-rose-200 px-3 py-2 text-sm font-semibold text-rose-950">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" variant="green" disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create Set' : 'Save Changes'}
            </Button>
            <Button to="/" variant="neutral">
              Back to My Sets
            </Button>
          </div>
        </form>
      </Panel>

      {!isNew && id && (
        <Panel className="bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">
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
            className="mb-4 flex flex-col gap-2 rounded-xl border-[3px] border-dashed border-black bg-emerald-50 p-3"
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="Front (e.g. agricola)"
                className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 font-medium"
              />
              <input
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Back (e.g. farmer)"
                className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 font-medium"
              />
            </div>
            {extraFields.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {extraFields.map((f) => (
                  <input
                    key={f.key}
                    value={newExtra[f.key] ?? ''}
                    onChange={(e) =>
                      setNewExtra((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                    placeholder={f.label}
                    className="rounded-lg border-[3px] border-black bg-white px-2 py-1.5 text-sm font-medium"
                  />
                ))}
              </div>
            )}
            <Button
              type="submit"
              variant="green"
              size="sm"
              disabled={addingCard || !newFront.trim() || !newBack.trim()}
              className="self-start"
            >
              {addingCard ? 'Adding…' : '+ Add Card'}
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            {cards.length === 0 ? (
              <p className="font-medium text-slate-500">
                No cards yet — add one above, or bulk import.
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
