-- ═══════════════════════════════════════════════════════════════
--  Sondages externes avec vérification email professionnel
--  Domaine autorisé : @iliad-free.fr
-- ═══════════════════════════════════════════════════════════════

-- Mode de participation :
-- adherents_only     : profil adhérent actif obligatoire
-- professional_email : email professionnel vérifié obligatoire
-- mixed              : adhérent actif OU email professionnel vérifié
ALTER TABLE public.surveys
  ADD COLUMN IF NOT EXISTS participation_mode text NOT NULL DEFAULT 'adherents_only',
  ADD COLUMN IF NOT EXISTS allowed_email_domain text NOT NULL DEFAULT 'iliad-free.fr';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'surveys_participation_mode_check'
  ) THEN
    ALTER TABLE public.surveys
      ADD CONSTRAINT surveys_participation_mode_check
      CHECK (participation_mode IN ('adherents_only', 'professional_email', 'mixed'));
  END IF;
END $$;

-- Codes temporaires de vérification.
-- Aucun email n'est stocké en clair : uniquement une empreinte email_hash.
CREATE TABLE IF NOT EXISTS public.survey_email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  email_hash text NOT NULL,
  code_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Participants externes validés.
-- Nom/prénom conservés pour la crédibilité du vote.
-- Email professionnel non conservé en clair.
CREATE TABLE IF NOT EXISTS public.survey_external_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT survey_external_participants_unique UNIQUE (survey_id, email_hash)
);

-- Lien optionnel des réponses vers un participant externe.
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS external_participant_id uuid REFERENCES public.survey_external_participants(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_survey_email_verifications_survey_hash
  ON public.survey_email_verifications(survey_id, email_hash);

CREATE INDEX IF NOT EXISTS idx_survey_email_verifications_expires
  ON public.survey_email_verifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_survey_external_participants_survey_hash
  ON public.survey_external_participants(survey_id, email_hash);

CREATE INDEX IF NOT EXISTS idx_survey_responses_external_participant
  ON public.survey_responses(external_participant_id);

ALTER TABLE public.survey_email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_external_participants ENABLE ROW LEVEL SECURITY;

-- Les tables de vérification sont pilotées par Edge Functions avec service_role.
-- Les admins peuvent consulter les participants externes sans voir les emails.
DROP POLICY IF EXISTS "survey_external_participants_admin_select" ON public.survey_external_participants;
CREATE POLICY "survey_external_participants_admin_select"
  ON public.survey_external_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'secretaire')
    )
  );

DROP POLICY IF EXISTS "survey_email_verifications_admin_select" ON public.survey_email_verifications;
CREATE POLICY "survey_email_verifications_admin_select"
  ON public.survey_email_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

COMMENT ON COLUMN public.surveys.participation_mode IS 'adherents_only, professional_email, mixed';
COMMENT ON COLUMN public.surveys.allowed_email_domain IS 'Domaine professionnel autorisé sans @, par défaut iliad-free.fr';
COMMENT ON TABLE public.survey_email_verifications IS 'Codes temporaires. Email non stocké en clair, uniquement email_hash.';
COMMENT ON TABLE public.survey_external_participants IS 'Participants externes validés. Email professionnel non stocké en clair.';
