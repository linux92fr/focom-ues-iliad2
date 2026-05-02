import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const FALLBACK_URL = 'https://hduqvneurhqjyjlmrlxs.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdXF2bmV1cmhxanlqbG1ybHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTQ4NzMsImV4cCI6MjA4MzQzMDg3M30.J3aTkTv5KiA81Qb8opORK_yAiz7LQ9V5e_AmvGsEU-s';

function validUrl(val: string | undefined): boolean {
  try { return !!val && /^https?:\/\/.+/.test(val); } catch { return false; }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = validUrl(rawUrl) ? rawUrl : FALLBACK_URL;
// N'accepter que les clés JWT (format anon legacy), rejeter les publishable keys (sb_publishable_...)
const SUPABASE_KEY = rawKey && rawKey.startsWith('eyJ') ? rawKey : FALLBACK_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
