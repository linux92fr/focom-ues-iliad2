-- Security hardening for privileged tables, public submissions and profiles.

-- Keep PV writes aligned with the elevated Edge Function operations.
DROP POLICY IF EXISTS "pv_documents_auth_write" ON public.pv_documents;
DROP POLICY IF EXISTS "pv_documents_auth_update" ON public.pv_documents;
DROP POLICY IF EXISTS "pv_documents_auth_delete" ON public.pv_documents;
DROP POLICY IF EXISTS "pv_documents_elevated_write" ON public.pv_documents;
DROP POLICY IF EXISTS "pv_documents_elevated_update" ON public.pv_documents;
DROP POLICY IF EXISTS "pv_documents_elevated_delete" ON public.pv_documents;

CREATE POLICY "pv_documents_elevated_write"
ON public.pv_documents FOR INSERT TO authenticated
WITH CHECK (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

CREATE POLICY "pv_documents_elevated_update"
ON public.pv_documents FOR UPDATE TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
)
WITH CHECK (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

CREATE POLICY "pv_documents_elevated_delete"
ON public.pv_documents FOR DELETE TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

-- Survey responses are private data. Public pages use aggregate RPCs below.
DROP POLICY IF EXISTS "survey_responses_select_own" ON public.survey_responses;
DROP POLICY IF EXISTS "survey_responses_insert_auth" ON public.survey_responses;
DROP POLICY IF EXISTS "Users can view own responses" ON public.survey_responses;
DROP POLICY IF EXISTS "Users can submit responses" ON public.survey_responses;

CREATE POLICY "survey_responses_select_own"
ON public.survey_responses FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'secretaire', 'representant']::public.user_role[]
  )
);

CREATE POLICY "survey_responses_insert_auth"
ON public.survey_responses FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.surveys s
    WHERE s.id = survey_id
      AND s.is_active = true
      AND (s.starts_at IS NULL OR s.starts_at <= now())
      AND (s.ends_at IS NULL OR s.ends_at >= now())
  )
  AND EXISTS (
    SELECT 1
    FROM public.survey_questions q
    WHERE q.id = public.survey_responses.question_id
      AND q.survey_id = public.survey_responses.survey_id
  )
  AND (
    option_id IS NULL
    OR EXISTS (
      SELECT 1
      FROM public.survey_options o
      WHERE o.id = public.survey_responses.option_id
        AND o.question_id = public.survey_responses.question_id
    )
  )
);

CREATE OR REPLACE FUNCTION public.get_survey_results(p_survey_id uuid)
RETURNS TABLE (
  question_id uuid,
  option_id uuid,
  total_count bigint,
  participant_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH responses AS (
    SELECT sr.question_id, sr.option_id
    FROM public.survey_responses sr
    WHERE sr.survey_id = p_survey_id
  ),
  participants AS (
    SELECT count(DISTINCT coalesce(sr.user_id::text, sr.external_participant_id::text)) AS total
    FROM public.survey_responses sr
    WHERE sr.survey_id = p_survey_id
  )
  SELECT
    r.question_id,
    r.option_id,
    count(*)::bigint AS total_count,
    (SELECT total FROM participants)::bigint AS participant_count
  FROM responses r
  GROUP BY r.question_id, r.option_id;
$$;

REVOKE ALL ON FUNCTION public.get_survey_results(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_survey_results(uuid) TO anon, authenticated;

-- Public documents are managed only by elevated roles.
DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
DROP POLICY IF EXISTS "documents_elevated_insert" ON public.documents;
DROP POLICY IF EXISTS "documents_elevated_update" ON public.documents;
DROP POLICY IF EXISTS "documents_elevated_delete" ON public.documents;

CREATE POLICY "documents_elevated_insert"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

CREATE POLICY "documents_elevated_update"
ON public.documents FOR UPDATE TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
)
WITH CHECK (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

CREATE POLICY "documents_elevated_delete"
ON public.documents FOR DELETE TO authenticated
USING (
  public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

DROP POLICY IF EXISTS "Documents storage insert authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Documents storage insert elevated" ON storage.objects;
CREATE POLICY "Documents storage insert elevated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_any_role(
    auth.uid(),
    ARRAY['admin', 'representant', 'gestionnaire_documents']::public.user_role[]
  )
);

-- Upload diagnostics may only be written for the current user.
DROP POLICY IF EXISTS upload_diagnostics_insert ON public.upload_diagnostics;
CREATE POLICY upload_diagnostics_insert
ON public.upload_diagnostics FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Protect administrative profile columns without breaking normal profile edits.
CREATE OR REPLACE FUNCTION public.protect_profile_admin_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW := jsonb_populate_record(
      NEW,
      jsonb_build_object(
        'email', to_jsonb(OLD)->'email',
        'member_number', to_jsonb(OLD)->'member_number',
        'membership_date', to_jsonb(OLD)->'membership_date',
        'section', to_jsonb(OLD)->'section',
        'status', to_jsonb(OLD)->'status',
        'is_active', to_jsonb(OLD)->'is_active'
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_admin_columns() FROM PUBLIC;

DROP TRIGGER IF EXISTS protect_profile_admin_columns ON public.profiles;
CREATE TRIGGER protect_profile_admin_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_admin_columns();

-- Internal event table for anti-spam checks. RLS is enabled with no client policy.
CREATE TABLE IF NOT EXISTS public.public_submission_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket text NOT NULL,
  identity_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.public_submission_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS public_submission_events_lookup
ON public.public_submission_events(bucket, identity_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_public_submission_rate(
  p_bucket text,
  p_identity text,
  p_window_seconds integer DEFAULT 900,
  p_max_requests integer DEFAULT 3
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_identity_hash text := md5(lower(trim(coalesce(p_identity, ''))));
  v_recent_count integer;
BEGIN
  IF v_identity_hash = md5('') THEN
    RAISE EXCEPTION 'Identité de soumission requise' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_bucket || ':' || v_identity_hash));
  DELETE FROM public.public_submission_events
  WHERE created_at < now() - interval '2 days';

  SELECT count(*) INTO v_recent_count
  FROM public.public_submission_events
  WHERE bucket = p_bucket
    AND identity_hash = v_identity_hash
    AND created_at > now() - make_interval(secs => p_window_seconds);

  IF v_recent_count >= p_max_requests THEN
    RAISE EXCEPTION 'Trop de demandes. Réessayez dans quelques minutes.'
      USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.public_submission_events(bucket, identity_hash)
  VALUES (p_bucket, v_identity_hash);
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_public_submission_rate(text, text, integer, integer) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.guard_contact_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enforce_public_submission_rate('contact', NEW.email, 900, 2);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_newsletter_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enforce_public_submission_rate('newsletter', NEW.email, 3600, 3);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.guard_formation_submission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enforce_public_submission_rate(
    'formation',
    NEW.email || ':' || NEW.formation_title || ':' || NEW.session_start::text,
    3600,
    2
  );
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_contact_submission() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_newsletter_submission() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_formation_submission() FROM PUBLIC;

DROP TRIGGER IF EXISTS guard_contact_submission ON public.contact_messages;
CREATE TRIGGER guard_contact_submission
BEFORE INSERT ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.guard_contact_submission();

DROP TRIGGER IF EXISTS guard_newsletter_submission ON public.newsletter_subscribers;
CREATE TRIGGER guard_newsletter_submission
BEFORE INSERT ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.guard_newsletter_submission();

DROP TRIGGER IF EXISTS guard_formation_submission ON public.formation_requests;
CREATE TRIGGER guard_formation_submission
BEFORE INSERT ON public.formation_requests
FOR EACH ROW EXECUTE FUNCTION public.guard_formation_submission();

DROP POLICY IF EXISTS "Anyone can send a contact message" ON public.contact_messages;
DROP POLICY IF EXISTS "Anyone can send a validated contact message" ON public.contact_messages;
CREATE POLICY "Anyone can send a validated contact message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'non-lu'
  AND admin_reply IS NULL
  AND replied_at IS NULL
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

DROP POLICY IF EXISTS "newsletter_sub_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_sub_insert"
ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
WITH CHECK (
  is_active = true
  AND unsubscribed_at IS NULL
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_email_length,
  DROP CONSTRAINT IF EXISTS newsletter_email_format;
ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_email_length CHECK (char_length(email) <= 255),
  ADD CONSTRAINT newsletter_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');

ALTER TABLE public.formation_requests
  DROP CONSTRAINT IF EXISTS formation_required_text_lengths,
  DROP CONSTRAINT IF EXISTS formation_email_format;
ALTER TABLE public.formation_requests
  ADD CONSTRAINT formation_required_text_lengths CHECK (
    char_length(last_name) BETWEEN 1 AND 100
    AND char_length(first_name) BETWEEN 1 AND 100
    AND char_length(personal_address) BETWEEN 5 AND 255
    AND char_length(postal_code) BETWEEN 3 AND 10
    AND char_length(city) BETWEEN 1 AND 100
    AND char_length(email) <= 255
    AND char_length(company) BETWEEN 1 AND 255
    AND coalesce(char_length(phone), 0) <= 30
    AND coalesce(char_length(job_title), 0) <= 150
  ),
  ADD CONSTRAINT formation_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
