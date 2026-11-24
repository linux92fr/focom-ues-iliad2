-- ─────────────────────────────────────────────
--  Journal des notifications WhatsApp — FOCOM UES ILIAD
-- ─────────────────────────────────────────────

-- Une ligne par tentative d'envoi (fonction edge send-whatsapp)
CREATE TABLE IF NOT EXISTS public.whatsapp_notifications (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        timestamptz NOT NULL DEFAULT now(),
  user_id           uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  kind              text        NOT NULL CHECK (kind IN ('article', 'event')),
  target_id         uuid,
  title             text,
  phone             text,
  status            text        NOT NULL CHECK (status IN ('sent', 'failed')),
  message_id        text,
  provider_response jsonb
);

-- RLS : lecture réservée aux admins (l'insertion est faite par la service role,
-- qui contourne RLS)
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_notifications_admin" ON public.whatsapp_notifications;
CREATE POLICY "whatsapp_notifications_admin"
  ON public.whatsapp_notifications FOR ALL
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin']::public.user_role[])
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_created ON public.whatsapp_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_user    ON public.whatsapp_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_notifications_target  ON public.whatsapp_notifications(kind, target_id);
