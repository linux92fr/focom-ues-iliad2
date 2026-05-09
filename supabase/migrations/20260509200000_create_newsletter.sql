-- ═══════════════════════════════════════════════════════════════
--  Newsletter — FOCOM UES ILIAD
-- ═══════════════════════════════════════════════════════════════

-- Abonnés
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text        NOT NULL UNIQUE,
  is_active         boolean     NOT NULL DEFAULT true,
  subscribed_at     timestamptz NOT NULL DEFAULT now(),
  unsubscribe_token uuid        NOT NULL DEFAULT gen_random_uuid(),
  unsubscribed_at   timestamptz
);

-- Newsletters (brouillons + envoyées)
CREATE TABLE IF NOT EXISTS public.newsletters (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  subject     text        NOT NULL,
  body_html   text        NOT NULL,
  body_text   text,
  created_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Historique des envois
CREATE TABLE IF NOT EXISTS public.newsletter_sends (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id     uuid        NOT NULL REFERENCES public.newsletters(id) ON DELETE CASCADE,
  sent_by           uuid        NOT NULL REFERENCES auth.users(id),
  sent_at           timestamptz NOT NULL DEFAULT now(),
  status            text        NOT NULL DEFAULT 'sending',
  total_recipients  integer,
  successful_sends  integer,
  failed_sends      integer,
  error_details     text,
  CONSTRAINT newsletter_sends_status_check CHECK (status IN ('sending', 'completed', 'partial', 'failed'))
);

-- Index
CREATE INDEX IF NOT EXISTS idx_newsletter_sub_email  ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_sub_token  ON public.newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_sub_active ON public.newsletter_subscribers(is_active);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_nl   ON public.newsletter_sends(newsletter_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_newsletters_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW EXECUTE FUNCTION public.update_newsletters_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_sends       ENABLE ROW LEVEL SECURITY;

-- newsletter_subscribers : inscription publique
CREATE POLICY "newsletter_sub_insert"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- newsletter_subscribers : désabonnement via token (sécurité par obscurité du token UUID)
CREATE POLICY "newsletter_sub_update"
  ON public.newsletter_subscribers FOR UPDATE
  USING (true);

-- newsletter_subscribers : accès complet admin
CREATE POLICY "newsletter_sub_admin"
  ON public.newsletter_subscribers FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- newsletters : admin seulement
CREATE POLICY "newsletters_admin"
  ON public.newsletters FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- newsletter_sends : admin seulement
CREATE POLICY "newsletter_sends_admin"
  ON public.newsletter_sends FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'moderator'))
  );
