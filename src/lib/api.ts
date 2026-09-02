import { supabase } from './supabaseClient'
import type {
  CardProgress,
  ExtraFieldDef,
  FlashCard,
  FlashSet,
  StudySessionLog,
} from '../types'

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  const id = data.user?.id
  if (!id) throw new Error('Not signed in')
  return id
}

// ── Sets ─────────────────────────────────────────────────────────────────

export interface SetWithCount extends FlashSet {
  card_count: number
}

export async function listSets(): Promise<SetWithCount[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('*, cards(count)')
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((row) => {
    const { cards, ...set } = row as FlashSet & {
      cards: { count: number }[] | null
    }
    return { ...set, card_count: cards?.[0]?.count ?? 0 }
  })
}

export async function getSet(id: string): Promise<FlashSet> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as FlashSet
}

export async function getSets(ids: string[]): Promise<FlashSet[]> {
  if (ids.length === 0) return []
  const { data, error } = await supabase.from('sets').select('*').in('id', ids)
  if (error) throw error
  return data as FlashSet[]
}

export async function createSet(input: {
  name: string
  description?: string
  category?: string
  tags?: string[]
  extra_fields?: ExtraFieldDef[]
  strict_answers?: boolean
}): Promise<FlashSet> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('sets')
    .insert({
      user_id,
      name: input.name,
      description: input.description ?? null,
      category: input.category ?? null,
      tags: input.tags ?? [],
      extra_fields: input.extra_fields ?? [],
      strict_answers: input.strict_answers ?? false,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as FlashSet
}

export async function updateSet(
  id: string,
  patch: Partial<
    Pick<
      FlashSet,
      | 'name'
      | 'description'
      | 'category'
      | 'tags'
      | 'extra_fields'
      | 'strict_answers'
    >
  >,
): Promise<FlashSet> {
  const { data, error } = await supabase
    .from('sets')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as FlashSet
}

export async function deleteSet(id: string): Promise<void> {
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) throw error
}

/** Copies a set and all of its cards into a new set owned by the user. */
export async function duplicateSet(id: string): Promise<FlashSet> {
  const [original, cards] = await Promise.all([getSet(id), listCards(id)])
  const copy = await createSet({
    name: `${original.name} (copy)`,
    description: original.description ?? undefined,
    category: original.category ?? undefined,
    tags: original.tags,
    extra_fields: original.extra_fields,
    strict_answers: original.strict_answers,
  })
  await bulkCreateCards(
    copy.id,
    cards.map((c) => ({
      front: c.front,
      back: c.back,
      extra_data: c.extra_data,
      image_url: c.image_url,
    })),
  )
  return copy
}

// ── Cards ────────────────────────────────────────────────────────────────

export async function listCards(setId: string): Promise<FlashCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('set_id', setId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as FlashCard[]
}

export async function listCardsForSets(setIds: string[]): Promise<FlashCard[]> {
  if (setIds.length === 0) return []
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .in('set_id', setIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as FlashCard[]
}

export interface CardIndexEntry {
  id: string
  set_id: string
  front: string
}

/** Lightweight card index for computing progress without loading full rows. */
export async function listCardIndex(): Promise<CardIndexEntry[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, set_id, front')
  if (error) throw error
  return data as CardIndexEntry[]
}

export async function countAllCards(): Promise<number> {
  const { count, error } = await supabase
    .from('cards')
    .select('id', { count: 'exact', head: true })
  if (error) throw error
  return count ?? 0
}

export async function createCard(input: {
  set_id: string
  front: string
  back: string
  extra_data?: Record<string, string>
  image_url?: string | null
}): Promise<FlashCard> {
  const user_id = await requireUserId()
  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id,
      set_id: input.set_id,
      front: input.front,
      back: input.back,
      extra_data: input.extra_data ?? {},
      image_url: input.image_url ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data as FlashCard
}

export async function updateCard(
  id: string,
  patch: Partial<Pick<FlashCard, 'front' | 'back' | 'extra_data' | 'image_url'>>,
): Promise<FlashCard> {
  const { data, error } = await supabase
    .from('cards')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as FlashCard
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export async function bulkCreateCards(
  setId: string,
  rows: {
    front: string
    back: string
    extra_data?: Record<string, string>
    image_url?: string | null
  }[],
): Promise<void> {
  if (rows.length === 0) return
  const user_id = await requireUserId()
  const { error } = await supabase.from('cards').insert(
    rows.map((r) => ({
      user_id,
      set_id: setId,
      front: r.front,
      back: r.back,
      extra_data: r.extra_data ?? {},
      image_url: r.image_url ?? null,
    })),
  )
  if (error) throw error
}

// ── Card images (Supabase Storage) ───────────────────────────────────────

const IMAGE_BUCKET = 'card-images'

export async function uploadCardImage(file: File): Promise<string> {
  const user_id = await requireUserId()
  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'png'
  const path = `${user_id}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type })
  if (error) throw error
  return path
}

/**
 * Card images live in a private bucket, so they're fetched through short
 * lived signed URLs rather than a permanent public link.
 */
export async function signedImageUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, 60 * 60)
  if (error) return null
  return data.signedUrl
}

export async function deleteCardImage(path: string): Promise<void> {
  await supabase.storage.from(IMAGE_BUCKET).remove([path])
}

// ── Progress ─────────────────────────────────────────────────────────────

export async function listProgressForCards(
  cardIds: string[],
): Promise<CardProgress[]> {
  if (cardIds.length === 0) return []

  // Supabase caps URL length, so ask in chunks for very large pools.
  const chunkSize = 200
  const results: CardProgress[] = []
  for (let i = 0; i < cardIds.length; i += chunkSize) {
    const chunk = cardIds.slice(i, i + chunkSize)
    const { data, error } = await supabase
      .from('card_progress')
      .select('*')
      .in('card_id', chunk)
    if (error) throw error
    results.push(...(data as CardProgress[]))
  }
  return results
}

export async function listAllProgress(): Promise<CardProgress[]> {
  const { data, error } = await supabase.from('card_progress').select('*')
  if (error) throw error
  return data as CardProgress[]
}

export async function upsertProgress(input: {
  card_id: string
  dots?: number
  known?: boolean
  starred?: boolean
  times_seen?: number
  times_correct?: number
}): Promise<void> {
  const user_id = await requireUserId()
  const { card_id, ...fields } = input
  const { error } = await supabase.from('card_progress').upsert(
    {
      user_id,
      card_id,
      ...fields,
      last_reviewed: new Date().toISOString(),
    },
    { onConflict: 'user_id,card_id' },
  )
  if (error) throw error
}

// ── Study sessions (stats + streaks) ─────────────────────────────────────

export async function logStudySession(input: {
  mode: string
  cards_studied: number
  cards_correct: number
}): Promise<void> {
  if (input.cards_studied === 0) return
  const user_id = await requireUserId()
  const { error } = await supabase.from('study_sessions').insert({
    user_id,
    mode: input.mode,
    cards_studied: input.cards_studied,
    cards_correct: input.cards_correct,
  })
  if (error) throw error
}

export async function listRecentSessions(
  limit = 100,
): Promise<StudySessionLog[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as StudySessionLog[]
}
