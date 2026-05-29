// Réexport unique depuis le client principal — évite le double instanciation
export { supabase } from '@/integrations/supabase/client';
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}