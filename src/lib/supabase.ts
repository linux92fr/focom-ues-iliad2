import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://hduqvneurhqjyjlmrlxs.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkdXF2bmV1cmhxanlqbG1ybHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NTQ4NzMsImV4cCI6MjA4MzQzMDg3M30.J3aTkTv5KiA81Qb8opORK_yAiz7LQ9V5e_AmvGsEU-s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}
