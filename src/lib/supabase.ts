// Réexport unique depuis le client principal — évite le double instanciation.
export { supabase } from '@/integrations/supabase/client';

export type AdminUser = {
  id: string
  email: string
  role: 'admin' | 'editor'
}
