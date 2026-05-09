-- Storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reclamations',
  'reclamations',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "reclamations_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'reclamations' AND auth.uid() IS NOT NULL AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "reclamations_user_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reclamations' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'moderator'::app_role)
    )
  );

CREATE POLICY "reclamations_user_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'reclamations' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Tables
CREATE TABLE IF NOT EXISTS reclamations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email   TEXT,
  title        TEXT        NOT NULL,
  description  TEXT        NOT NULL,
  category     TEXT        NOT NULL DEFAULT 'rh'      CHECK (category IN ('rh','juridique','autre')),
  entity       TEXT        NOT NULL DEFAULT 'autre'   CHECK (entity   IN ('free','free_mobile','free_reseau','alice','iliad','autre')),
  priority     TEXT        NOT NULL DEFAULT 'normale' CHECK (priority IN ('normale','urgente','critique')),
  status       TEXT        NOT NULL DEFAULT 'nouveau' CHECK (status   IN ('nouveau','en_cours','resolu','ferme')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamation_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id   UUID        NOT NULL REFERENCES reclamations(id) ON DELETE CASCADE,
  author_id        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  is_admin         BOOLEAN     NOT NULL DEFAULT false,
  content          TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reclamation_attachments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reclamation_id   UUID        NOT NULL REFERENCES reclamations(id) ON DELETE CASCADE,
  file_name        TEXT        NOT NULL,
  file_path        TEXT        NOT NULL,
  file_size        INTEGER,
  mime_type        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reclamations_user_id        ON reclamations(user_id);
CREATE INDEX IF NOT EXISTS idx_reclamations_status         ON reclamations(status);
CREATE INDEX IF NOT EXISTS idx_reclamation_messages_rec_id ON reclamation_messages(reclamation_id);
CREATE INDEX IF NOT EXISTS idx_reclamation_attach_rec_id   ON reclamation_attachments(reclamation_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS reclamations_updated_at ON reclamations;
CREATE TRIGGER reclamations_updated_at
  BEFORE UPDATE ON reclamations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE reclamations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reclamation_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reclamation_attachments ENABLE ROW LEVEL SECURITY;

-- reclamations
CREATE POLICY "rec_user_select" ON reclamations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rec_user_insert" ON reclamations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rec_user_update" ON reclamations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "rec_admin_all"   ON reclamations FOR ALL    USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);

-- messages
CREATE POLICY "msg_user_select" ON reclamation_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM reclamations WHERE id = reclamation_id AND user_id = auth.uid())
);
CREATE POLICY "msg_user_insert" ON reclamation_messages FOR INSERT WITH CHECK (
  auth.uid() = author_id AND NOT is_admin AND
  EXISTS (SELECT 1 FROM reclamations WHERE id = reclamation_id AND user_id = auth.uid())
);
CREATE POLICY "msg_admin_all" ON reclamation_messages FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);

-- attachments
CREATE POLICY "att_user_select" ON reclamation_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM reclamations WHERE id = reclamation_id AND user_id = auth.uid())
);
CREATE POLICY "att_user_insert" ON reclamation_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM reclamations WHERE id = reclamation_id AND user_id = auth.uid())
);
CREATE POLICY "att_admin_all" ON reclamation_attachments FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
);
