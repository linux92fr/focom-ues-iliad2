CREATE TABLE IF NOT EXISTS public.passkey_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id text NOT NULL UNIQUE,
  public_key text NOT NULL,
  counter bigint NOT NULL DEFAULT 0,
  name text,
  aaguid text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.webauthn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_passkey_credentials"
  ON public.passkey_credentials FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "user_view_own_passkeys"
  ON public.passkey_credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_delete_own_passkeys"
  ON public.passkey_credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "service_webauthn_challenges"
  ON public.webauthn_challenges FOR ALL TO service_role USING (true) WITH CHECK (true);
