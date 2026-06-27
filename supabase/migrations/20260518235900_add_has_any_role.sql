-- Fonction utilitaire : vérifie si un utilisateur possède l'un des rôles donnés
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles text[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = ANY(_roles)
  )
$$;
