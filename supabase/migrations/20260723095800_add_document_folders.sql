-- Sous-dossiers pour "Mes documents"
CREATE TABLE IF NOT EXISTS public.document_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_folders_owner_select ON public.document_folders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY document_folders_owner_insert ON public.document_folders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY document_folders_owner_update ON public.document_folders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY document_folders_owner_delete ON public.document_folders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.user_documents
  ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES public.document_folders(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS user_documents_folder_id_idx ON public.user_documents(folder_id);
