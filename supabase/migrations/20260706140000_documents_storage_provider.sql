-- Prépare le stockage hybride : chaque document sait où son fichier physique vit
-- ('supabase' = bucket Storage existant, 'o2switch' = pont PHP hébergé sur o2switch).
-- Les documents déjà présents restent marqués 'supabase' (valeur du DEFAULT au moment
-- de l'ajout de colonne) ; le DEFAULT est ensuite changé pour que tout nouvel upload
-- utilise o2switch, qui offre davantage d'espace.
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS storage_provider text NOT NULL DEFAULT 'supabase';

ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_storage_provider_check;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_storage_provider_check CHECK (storage_provider IN ('supabase', 'o2switch'));

ALTER TABLE public.documents
  ALTER COLUMN storage_provider SET DEFAULT 'o2switch';
