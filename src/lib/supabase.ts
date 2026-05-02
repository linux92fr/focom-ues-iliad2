import { createClient } from '@supabase/supabase-js'

const FALLBACK_URL = 'https://hduqvneurhqjyjlmrlxs.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdXF2bmV1cmhxanlqbG1ybHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTQ4NzMsImV4cCI6MjA4MzQzMDg3M30.J3aTkTv5KiA81Qb8opORK_yAiz7LQ9V5e_AmvGsEU-s';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_ANON_KEY_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseUrl = (rawUrl && /^https?:\/\/.+/.test(rawUrl)) ? rawUrl : FALLBACK_URL;
export const supabaseAnonKey = (rawKey && rawKey.length > 20) ? rawKey : FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}
