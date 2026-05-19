-- Creation propre du module Reclamations
-- Compatible avec les roles existants : admin, secretaire, representant

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reclamations',
  'reclamations',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.reclamations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'rh' CHECK (category IN ('rh','juridique','autre')),
  entity text NOT NULL DEFAULT 'autre' CHECK (entity IN ('free','free_mobile','free_reseau','alice','iliad','autre')),
  priority text NOT NULL DEFAULT 'normale' CHECK (priority IN ('normale','urgente','critique')),
  status text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau','en_cours','resolu','ferme')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reclamation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id uuid NOT NULL REFERENCES public.reclamations(id) ON DELETE CASCADE,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_admin boolean NOT NULL DEFAULT false,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reclamation_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id uuid NOT NULL REFERENCES public.reclamations(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reclamations_user_id ON public.reclamations(user_id);
CREATE INDEX IF NOT EXISTS idx_reclamations_status ON public.reclamations(status);
CREATE INDEX IF NOT EXISTS idx_reclamation_messages_rec_id ON public.reclamation_messages(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_attach_rec_id ON public.reclamation_attachments(reclamation_id);

CREATE OR REPLACE FUNCTION public.update_reclamations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reclamations_updated_at ON public.reclamations;
CREATE TRIGGER reclamations_updated_at
BEFORE UPDATE ON public.reclamations
FOR EACH ROW
EXECUTE FUNCTION public.update_reclamations_updated_at();

ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reclamation_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rec_user_select ON public.reclamations;
CREATE POLICY rec_user_select ON public.reclamations
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS rec_user_insert ON public.reclamations;
CREATE POLICY rec_user_insert ON public.reclamations
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS rec_user_update ON public.reclamations;
CREATE POLICY rec_user_update ON public.reclamations
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS rec_admin_all ON public.reclamations;
CREATE POLICY rec_admin_all ON public.reclamations
FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
);

DROP POLICY IF EXISTS msg_user_select ON public.reclamation_messages;
CREATE POLICY msg_user_select ON public.reclamation_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reclamations
    WHERE id = reclamation_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS msg_user_insert ON public.reclamation_messages;
CREATE POLICY msg_user_insert ON public.reclamation_messages
FOR INSERT WITH CHECK (
  auth.uid() = author_id
  AND is_admin = false
  AND EXISTS (
    SELECT 1 FROM public.reclamations
    WHERE id = reclamation_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS msg_admin_all ON public.reclamation_messages;
CREATE POLICY msg_admin_all ON public.reclamation_messages
FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
);

DROP POLICY IF EXISTS att_user_select ON public.reclamation_attachments;
CREATE POLICY att_user_select ON public.reclamation_attachments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reclamations
    WHERE id = reclamation_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS att_user_insert ON public.reclamation_attachments;
CREATE POLICY att_user_insert ON public.reclamation_attachments
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reclamations
    WHERE id = reclamation_id AND user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS att_admin_all ON public.reclamation_attachments;
CREATE POLICY att_admin_all ON public.reclamation_attachments
FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
);

DROP POLICY IF EXISTS reclamations_user_upload ON storage.objects;
CREATE POLICY reclamations_user_upload ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'reclamations'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS reclamations_user_read ON storage.objects;
CREATE POLICY reclamations_user_read ON storage.objects
FOR SELECT USING (
  bucket_id = 'reclamations'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::user_role[])
  )
);

DROP POLICY IF EXISTS reclamations_user_delete ON storage.objects;
CREATE POLICY reclamations_user_delete ON storage.objects
FOR DELETE USING (
  bucket_id = 'reclamations'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
