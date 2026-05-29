ALTER TABLE public.passkey_credentials
  ADD COLUMN IF NOT EXISTS public_key_format text NOT NULL DEFAULT 'attestation_object';
