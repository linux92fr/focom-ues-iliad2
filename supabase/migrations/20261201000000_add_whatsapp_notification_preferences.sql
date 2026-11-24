-- ─────────────────────────────────────────────
--  Préférences de notification (dont WhatsApp) — FOCOM UES ILIAD
-- ─────────────────────────────────────────────

-- Table des préférences de notification par utilisateur
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  notify_articles   boolean     NOT NULL DEFAULT true,
  notify_actions    boolean     NOT NULL DEFAULT true,
  notify_formations boolean     NOT NULL DEFAULT true,
  notify_whatsapp   boolean     NOT NULL DEFAULT false,
  whatsapp_number   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Idempotent : ajoute les colonnes si la table existait déjà sans elles
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS notify_articles   boolean NOT NULL DEFAULT true;
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS notify_actions    boolean NOT NULL DEFAULT true;
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS notify_formations boolean NOT NULL DEFAULT true;
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS notify_whatsapp   boolean NOT NULL DEFAULT false;
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS whatsapp_number   text;
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS created_at        timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.notification_preferences ADD COLUMN IF NOT EXISTS updated_at        timestamptz NOT NULL DEFAULT now();

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── RLS ───
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur lit ses propres préférences
DROP POLICY IF EXISTS "notification_preferences_select_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select_own"
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());

-- Chaque utilisateur crée sa ligne de préférences
DROP POLICY IF EXISTS "notification_preferences_insert_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_insert_own"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Chaque utilisateur met à jour ses propres préférences
DROP POLICY IF EXISTS "notification_preferences_update_own" ON public.notification_preferences;
CREATE POLICY "notification_preferences_update_own"
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Accès complet pour les admins/modérateurs
DROP POLICY IF EXISTS "notification_preferences_admin" ON public.notification_preferences;
CREATE POLICY "notification_preferences_admin"
  ON public.notification_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_whatsapp ON public.notification_preferences(notify_whatsapp) WHERE notify_whatsapp = true;
