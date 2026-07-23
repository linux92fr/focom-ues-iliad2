import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const PROJECT_SUPABASE_URL = 'https://qinekdmyycyujsrcsfbe.supabase.co';
const PLACEHOLDER_VALUES = new Set([
  '',
  'your_supabase_project_url',
  'your_supabase_anon_key',
]);

function cleanEnvValue(value: string | undefined): string {
  return (value || '').trim().replace(/^['\"]|['\"]$/g, '');
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const rawSupabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL);
const rawSupabaseKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

const SUPABASE_URL = !PLACEHOLDER_VALUES.has(rawSupabaseUrl) && isValidHttpUrl(rawSupabaseUrl)
  ? rawSupabaseUrl
  : PROJECT_SUPABASE_URL;

const SUPABASE_KEY = !PLACEHOLDER_VALUES.has(rawSupabaseKey)
  ? rawSupabaseKey
  : '';

if (!SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase anon key. Please set VITE_SUPABASE_ANON_KEY in your deployment environment.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});

// Valeurs résolues, réutilisables pour un upload direct (XHR) plus robuste sur mobile
// que le fetch multipart de supabase-js (voir uploadFileViaXHR dans MesDocuments).
export const SUPABASE_PROJECT_URL = SUPABASE_URL;
export const SUPABASE_ANON_KEY = SUPABASE_KEY;
