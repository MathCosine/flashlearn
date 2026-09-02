import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * When the keys are missing we still hand back a client so the app can
 * mount and render a helpful setup screen instead of a blank page.
 */
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
)
