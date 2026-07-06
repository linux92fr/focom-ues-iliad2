-- Le type public.user_role existe déjà en production (créé hors suivi Git) mais n'apparaît
-- dans aucune migration trackée : sur une base rejouée depuis zéro (ex. Supabase Preview
-- Branch), il n'existe pas encore. On le crée défensivement avec les mêmes valeurs qu'en
-- prod (no-op si déjà présent) avant d'y ajouter le nouveau rôle.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM (
      'admin', 'representant', 'adherent', 'public', 'redacteur', 'tresorier', 'secretaire', 'visio', 'gestionnaire_documents'
    );
  END IF;
END $$;

-- Nouveau rôle dédié à la gestion élargie des documents (upload/organisation/archivage/suppression
-- sur l'ensemble des documents, pas seulement les siens), sans donner les autres droits admin.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gestionnaire_documents';
