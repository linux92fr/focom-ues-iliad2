-- LOW-1: automatic cleanup of expired WebAuthn challenges
-- Runs every 10 minutes via pg_cron (extension must be enabled on the project)

create extension if not exists pg_cron with schema extensions;

select cron.schedule(
  'purge-expired-webauthn-challenges',
  '*/10 * * * *',
  $$
    delete from public.webauthn_challenges
    where expires_at < now();
  $$
);
