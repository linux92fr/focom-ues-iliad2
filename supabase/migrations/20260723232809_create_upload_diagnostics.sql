-- Journal de diagnostic temporaire pour tracer les échecs d'upload de document sur mobile.
-- Les insertions REST fonctionnent sur mobile, ce qui permet de tracer précisément
-- où l'upload de fichier échoue (lecture du fichier, envoi XHR, réponse serveur…).
CREATE TABLE IF NOT EXISTS public.upload_diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  step text NOT NULL,
  detail jsonb,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.upload_diagnostics ENABLE ROW LEVEL SECURITY;

-- N'importe quel visiteur authentifié peut écrire ses propres traces de diagnostic.
CREATE POLICY upload_diagnostics_insert ON public.upload_diagnostics
  FOR INSERT TO authenticated WITH CHECK (true);
