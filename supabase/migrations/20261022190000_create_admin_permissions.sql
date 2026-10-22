-- Gestion des autorisations administratives par rôle et par utilisateur.
-- Ces paramètres sont stockés séparément des rôles existants et ne modifient aucun accès par défaut.
CREATE TABLE IF NOT EXISTS public.admin_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  section text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (role, section)
);

CREATE TABLE IF NOT EXISTS public.admin_user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  can_view boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, section),
  CONSTRAINT admin_user_permission_edit_requires_view CHECK (NOT can_edit OR can_view)
);

ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_user_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage role permissions" ON public.admin_role_permissions;
CREATE POLICY "Admins manage role permissions"
ON public.admin_role_permissions
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'
));

DROP POLICY IF EXISTS "Admins manage individual permissions" ON public.admin_user_permissions;
CREATE POLICY "Admins manage individual permissions"
ON public.admin_user_permissions
FOR ALL TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'
));

CREATE INDEX IF NOT EXISTS admin_user_permissions_user_id_idx
ON public.admin_user_permissions(user_id);
