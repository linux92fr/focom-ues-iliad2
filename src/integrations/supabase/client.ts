import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = 'https://hduqvneurhqjyjlmrlxs.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdXF2bmV1cmhxanlqbG1ybHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTQ4NzMsImV4cCI6MjA4MzQzMDg3M30.J3aTkTv5KiA81Qb8opORK_yAiz7LQ9V5e_AmvGsEU-s';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
