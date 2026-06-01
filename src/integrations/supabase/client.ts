import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const PROJECT_SUPABASE_URL = 'https://qinekdmyycyujsrcsfbe.supabase.co';
const PROJECT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmVrZG15eWN5dWpzcmNzZmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ5MzMsImV4cCI6MjA3Mzc5MDkzM30.eMjxUkp9OLif7VUBNMao6ONEouYPtB2GIoIqprlhzUM';
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
  : PROJECT_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Bypass Web Locks API bug in Supabase JS v2 that causes AbortError loop
    lock: (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => fn(),
  },
});
