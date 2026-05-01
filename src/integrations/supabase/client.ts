// ✅ Gardez simplement ça — c'est correct
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = "https://qinekdmyycyujsrcsfbe.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmVrZG15eWN5dWpzcmNzZmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ5MzMsImV4cCI6MjA3Mzc5MDkzM30.eMjxUkp9OLif7VUBNMao6ONEouYPtB2GIoIqprlhzUM";
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
