-- ═══════════════════════════════════════════════════════════════
--  Sondages (surveys) — FOCOM UES ILIAD
-- ═══════════════════════════════════════════════════════════════

-- Table principale
CREATE TABLE IF NOT EXISTS public.surveys (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text        NOT NULL,
  description      text,
  is_active        boolean     NOT NULL DEFAULT true,
  is_anonymous     boolean     NOT NULL DEFAULT false,
  allow_multiple_votes boolean NOT NULL DEFAULT false,
  starts_at        timestamptz,
  ends_at          timestamptz,
  created_by       uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     uuid  NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_text text  NOT NULL,
  question_type text  NOT NULL DEFAULT 'single_choice',  -- single_choice | multiple_choice | text
  display_order int   NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT survey_questions_type_check CHECK (question_type IN ('single_choice', 'multiple_choice', 'text'))
);

-- Options de réponse (pour single_choice et multiple_choice)
CREATE TABLE IF NOT EXISTS public.survey_options (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id   uuid  NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_text   text  NOT NULL,
  display_order int   NOT NULL DEFAULT 0
);

-- Réponses des adhérents
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id            uuid  PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     uuid  NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  question_id   uuid  NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
  option_id     uuid  REFERENCES public.survey_options(id) ON DELETE CASCADE,
  text_response text,
  user_id       uuid  REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_surveys_active        ON public.surveys(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON public.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_options_question ON public.survey_options(question_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey  ON public.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user    ON public.survey_responses(user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_surveys_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER surveys_updated_at
  BEFORE UPDATE ON public.surveys
  FOR EACH ROW EXECUTE FUNCTION public.update_surveys_updated_at();

-- ─── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.surveys          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_options   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- surveys : lecture publique des sondages actifs
CREATE POLICY "surveys_select_active"
  ON public.surveys FOR SELECT
  USING (is_active = true);

-- surveys : CRUD complet pour admin/moderator
CREATE POLICY "surveys_all_admin"
  ON public.surveys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- questions & options : lecture publique (via sondage actif)
CREATE POLICY "survey_questions_select"
  ON public.survey_questions FOR SELECT USING (true);

CREATE POLICY "survey_questions_all_admin"
  ON public.survey_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "survey_options_select"
  ON public.survey_options FOR SELECT USING (true);

CREATE POLICY "survey_options_all_admin"
  ON public.survey_options FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- responses : un adhérent peut lire ses propres réponses et insérer
CREATE POLICY "survey_responses_select_own"
  ON public.survey_responses FOR SELECT
  USING (user_id = auth.uid() OR is_anonymous_survey(survey_id) OR
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "survey_responses_insert_auth"
  ON public.survey_responses FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "survey_responses_all_admin"
  ON public.survey_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'moderator')
    )
  );

-- Fonction helper pour la politique anonyme
CREATE OR REPLACE FUNCTION public.is_anonymous_survey(p_survey_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT is_anonymous FROM public.surveys WHERE id = p_survey_id), false);
$$;
