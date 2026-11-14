-- Portail Formation FO COM UES ILIAD - demandes publiques et accès gestionnaire dédié
-- Le rôle gestionnaire_formation ne donne aucun accès à l'administration générale.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gestionnaire_formation';

CREATE TABLE IF NOT EXISTS public.formation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'nouvelle'
    CHECK (status IN ('nouvelle','a_contacter','en_attente','validee','refusee','annulee')),
  region text NOT NULL DEFAULT 'IDF',
  departement text NOT NULL DEFAULT '75',
  stage_number text,
  formation_title text NOT NULL,
  session_start date NOT NULL,
  session_end date NOT NULL,
  training_location text,
  last_name text NOT NULL,
  first_name text NOT NULL,
  personal_address text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  email text NOT NULL,
  phone text,
  job_title text,
  company text NOT NULL,
  work_location text,
  department_name text,
  hr_contact_name text,
  company_address text,
  company_postal_code text,
  company_city text,
  local_union text,
  union_secretary text,
  first_level_completed boolean NOT NULL DEFAULT false,
  fo_member_current boolean NOT NULL DEFAULT false,
  employer_notice_date date,
  employer_response text,
  efo_status text NOT NULL DEFAULT 'a_faire'
    CHECK (efo_status IN ('a_faire','en_cours','validee','refusee')),
  notes text,
  CONSTRAINT formation_session_dates CHECK (session_end >= session_start)
);

ALTER TABLE public.formation_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit formation requests" ON public.formation_requests;
CREATE POLICY "Public can submit formation requests"
ON public.formation_requests FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'nouvelle'
  AND efo_status = 'a_faire'
  AND fo_member_current = true
  AND notes IS NULL
);

DROP POLICY IF EXISTS "Formation manager reads requests" ON public.formation_requests;
CREATE POLICY "Formation manager reads requests"
ON public.formation_requests FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role::text = 'gestionnaire_formation'
));

DROP POLICY IF EXISTS "Formation manager updates requests" ON public.formation_requests;
CREATE POLICY "Formation manager updates requests"
ON public.formation_requests FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role::text IN ('admin','gestionnaire_formation')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role::text IN ('admin','gestionnaire_formation')
));

CREATE INDEX IF NOT EXISTS formation_requests_session_idx
ON public.formation_requests (session_start, formation_title);
CREATE INDEX IF NOT EXISTS formation_requests_created_idx
ON public.formation_requests (created_at DESC);


-- Accès à l'API REST : les droits SQL complètent les politiques RLS ci-dessus.
GRANT INSERT ON TABLE public.formation_requests TO anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.formation_requests TO authenticated;
