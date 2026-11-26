-- Accès partagé à la recherche PV par code commun (à diffuser aux collègues).
-- Le code n'est stocké que sous forme de hash sha256 ; RLS activé sans
-- policy : seule l'edge function (clé service) peut lire la valeur.
CREATE TABLE IF NOT EXISTS public.pv_access (
  id int PRIMARY KEY,
  code_hash text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pv_access ENABLE ROW LEVEL SECURITY;

INSERT INTO public.pv_access (id, code_hash)
VALUES (1, '5ccb893c3fa190509fa503312affa91f8f7bde4feea2d53e76890f08f6c4c030')
ON CONFLICT (id) DO UPDATE SET code_hash = EXCLUDED.code_hash, updated_at = now();
