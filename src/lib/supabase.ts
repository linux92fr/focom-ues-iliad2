import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://votre-projet.supabase.co'
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'votre-cle-anon'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}
