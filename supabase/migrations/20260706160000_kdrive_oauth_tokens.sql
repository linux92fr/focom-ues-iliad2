-- Stocke le refresh_token OAuth2 kDrive (et un cache de l'access_token courant) dans une
-- table plutôt qu'un simple secret statique : Infomaniak peut faire tourner le
-- refresh_token à chaque rafraîchissement, la fonction Edge documents-kdrive doit donc
-- pouvoir persister la nouvelle valeur elle-même. Ligne singleton (id=1), aucune policy
-- pour anon/authenticated : seule la clé service_role (utilisée par la fonction Edge) y a
-- accès.
CREATE TABLE IF NOT EXISTS public.kdrive_oauth_tokens (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  refresh_token text NOT NULL,
  access_token text,
  access_token_expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kdrive_oauth_tokens ENABLE ROW LEVEL SECURITY;
