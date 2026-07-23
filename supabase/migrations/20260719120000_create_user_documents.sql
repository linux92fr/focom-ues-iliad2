-- Espace "Mes documents" : chaque adhérent peut y stocker ses propres fichiers,
-- privés par défaut, qu'il peut rendre visibles aux autres adhérents connectés.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-documents',
  'user-documents',
  false,
  20971520, -- 20 Mo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON public.user_documents(user_id);

CREATE OR REPLACE FUNCTION public.update_user_documents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_documents_updated_at ON public.user_documents;
CREATE TRIGGER user_documents_updated_at
BEFORE UPDATE ON public.user_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_user_documents_updated_at();

ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_documents_owner_select ON public.user_documents;
CREATE POLICY user_documents_owner_select ON public.user_documents
FOR SELECT USING (auth.uid() = user_id);

-- Un document marqué public reste réservé aux adhérents connectés (jamais aux anonymes).
DROP POLICY IF EXISTS user_documents_public_select ON public.user_documents;
CREATE POLICY user_documents_public_select ON public.user_documents
FOR SELECT TO authenticated USING (is_public = true);

DROP POLICY IF EXISTS user_documents_owner_insert ON public.user_documents;
CREATE POLICY user_documents_owner_insert ON public.user_documents
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_documents_owner_update ON public.user_documents;
CREATE POLICY user_documents_owner_update ON public.user_documents
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_documents_owner_delete ON public.user_documents;
CREATE POLICY user_documents_owner_delete ON public.user_documents
FOR DELETE USING (auth.uid() = user_id);

-- Storage : chaque utilisateur écrit/lit/supprime dans son propre dossier (préfixé par son
-- user_id) ; la lecture est aussi ouverte aux adhérents connectés pour les fichiers dont la
-- ligne user_documents correspondante est marquée publique.
DROP POLICY IF EXISTS user_documents_storage_upload ON storage.objects;
CREATE POLICY user_documents_storage_upload ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-documents'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS user_documents_storage_read ON storage.objects;
CREATE POLICY user_documents_storage_read ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-documents'
  AND auth.uid() IS NOT NULL
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_documents ud
      WHERE ud.file_path = storage.objects.name AND ud.is_public = true
    )
  )
);

DROP POLICY IF EXISTS user_documents_storage_delete ON storage.objects;
CREATE POLICY user_documents_storage_delete ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
