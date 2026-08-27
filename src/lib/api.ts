import { supabase } from './supabaseClient'
import type { CardProgress, ExtraFieldDef, FlashCard, FlashSet } from '../types'

// ── Sets ─────────────────────────────────────────────────────────────────

export async function listSets(): Promise<FlashSet[]> {
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as FlashSet[]
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

export async function createSet(input: {
  name: string
  description?: string
  category?: string
  tags?: string[]
  extra_fields?: ExtraFieldDef[]
  strict_answers?: boolean
}): Promise<FlashSet> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('sets')
    .insert({
      user_id: userId,
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

export async function createCard(input: {
  set_id: string
  front: string
  back: string
  extra_data?: Record<string, string>
}): Promise<FlashCard> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('cards')
    .insert({
      user_id: userId,
      set_id: input.set_id,
      front: input.front,
      back: input.back,
      extra_data: input.extra_data ?? {},
    })
    .select('*')
    .single()
  if (error) throw error
  return data as FlashCard
}

export async function updateCard(
  id: string,
  patch: Partial<Pick<FlashCard, 'front' | 'back' | 'extra_data'>>,
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
  rows: { front: string; back: string; extra_data?: Record<string, string> }[],
): Promise<void> {
  if (rows.length === 0) return
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')

  const { error } = await supabase.from('cards').insert(
    rows.map((r) => ({
      user_id: userId,
      set_id: setId,
      front: r.front,
      back: r.back,
      extra_data: r.extra_data ?? {},
    })),
  )
  if (error) throw error
}

// ── Progress (dot method / known tracking) ─────────────────────────────────

export async function listProgressForCards(
  cardIds: string[],
): Promise<CardProgress[]> {
  if (cardIds.length === 0) return []
  const { data, error } = await supabase
    .from('card_progress')
    .select('*')
    .in('card_id', cardIds)
  if (error) throw error
  return data as CardProgress[]
}

export async function upsertProgress(input: {
  card_id: string
  dots?: number
  known?: boolean
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Not signed in')

  const { error } = await supabase.from('card_progress').upsert(
    {
      user_id: userId,
      card_id: input.card_id,
      ...(input.dots !== undefined ? { dots: input.dots } : {}),
      ...(input.known !== undefined ? { known: input.known } : {}),
      last_reviewed: new Date().toISOString(),
    },
    { onConflict: 'user_id,card_id' },
  )
  if (error) throw error
}

export async function incrementDot(
  cardId: string,
  currentDots: number,
): Promise<void> {
  await upsertProgress({ card_id: cardId, dots: currentDots + 1 })
}
