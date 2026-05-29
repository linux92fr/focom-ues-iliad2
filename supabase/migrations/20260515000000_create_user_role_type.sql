-- Crée le type user_role et la fonction has_any_role utilisés dans les migrations suivantes.
-- Ces éléments existaient en production mais n'avaient pas été inclus dans les migrations.

CREATE TYPE public.user_role AS ENUM (
  'admin',
  'moderator',
  'representant',
  'adherent',
  'redacteur',
  'tresorier',
  'secretaire',
  'visio',
  'public'
);

-- Vérifie si un utilisateur possède l'un des rôles listés.
-- Compare en texte pour compatibilité avec la colonne app_role de user_roles.
CREATE OR REPLACE FUNCTION public.has_any_role(p_user_id uuid, p_roles public.user_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id
      AND role::text = ANY(ARRAY(SELECT unnest(p_roles)::text))
  );
$$;
