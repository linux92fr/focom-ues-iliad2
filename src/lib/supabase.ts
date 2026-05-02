import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://qinekdmyycyujsrcsfbe.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbmVrZG15eWN5dWpzcmNzZmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ5MzMsImV4cCI6MjA3Mzc5MDkzM30.eMjxUkp9OLif7VUBNMao6ONEouYPtB2GIoIqprlhzUM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}
