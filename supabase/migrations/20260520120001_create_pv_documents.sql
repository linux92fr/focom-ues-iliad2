CREATE TABLE IF NOT EXISTS public.pv_documents (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  filename      text NOT NULL,
  original_filename text,
  chunk_index   integer NOT NULL,
  content       text NOT NULL,
  embedding     vector(1536),
  metadata      jsonb DEFAULT '{}'::jsonb,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE public.pv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read" ON public.pv_documents
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "service_role_all" ON public.pv_documents
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "pv_documents_auth_write" ON public.pv_documents
  FOR INSERT TO public
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "pv_documents_auth_update" ON public.pv_documents
  FOR UPDATE TO public
  USING (auth.role() = 'authenticated');

CREATE POLICY "pv_documents_auth_delete" ON public.pv_documents
  FOR DELETE TO public
  USING (auth.role() = 'authenticated');
