-- Rappels quotidiens du calendrier de l'Avent (finalité unique, RGPD).
-- Consentement explicite (case non pré-cochée sur /avent), désinscription en un clic,
-- purge automatique des adresses le 6 janvier via pg_cron.

CREATE TABLE IF NOT EXISTS public.avent_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  unsubscribe_token text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  consented_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  sent_at timestamptz
);
ALTER TABLE public.avent_reminders ENABLE ROW LEVEL SECURITY;

-- Secret d'appel pg_cron pour l'envoi quotidien (la valeur n'est jamais versionnée ici).
CREATE TABLE IF NOT EXISTS public.avent_cron (
  id int PRIMARY KEY,
  secret text NOT NULL
);
ALTER TABLE public.avent_cron ENABLE ROW LEVEL SECURITY;
