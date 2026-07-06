-- Remplace o2switch par kDrive Infomaniak comme stockage secondaire des documents :
-- API officielle (upload/download/delete documentés), pas de script PHP maison à
-- maintenir, téléchargement par URL temporaire signée directement servie par kDrive.
-- Aucun document n'a encore été stocké sur o2switch (le pont n'était pas encore
-- déployé), la migration est donc sans impact sur les données existantes.
ALTER TABLE public.documents
  DROP CONSTRAINT IF EXISTS documents_storage_provider_check;
ALTER TABLE public.documents
  ADD CONSTRAINT documents_storage_provider_check CHECK (storage_provider IN ('supabase', 'kdrive'));

ALTER TABLE public.documents
  ALTER COLUMN storage_provider SET DEFAULT 'kdrive';
