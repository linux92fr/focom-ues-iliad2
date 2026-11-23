-- Permissions ONLYOFFICE dédiées, séparées de la matrice générique d'administration.
-- Les valeurs individuelles NULL héritent du rôle ; une valeur booléenne explicite prévaut.
CREATE TABLE IF NOT EXISTS public.onlyoffice_role_permissions (
  role text PRIMARY KEY,
  can_view boolean NOT NULL DEFAULT false,
  can_edit boolean NOT NULL DEFAULT false,
  can_download boolean NOT NULL DEFAULT false,
  can_print boolean NOT NULL DEFAULT false,
  can_comment boolean NOT NULL DEFAULT false,
  can_review boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT onlyoffice_role_edit_requires_view CHECK (NOT can_edit OR can_view)
);

CREATE TABLE IF NOT EXISTS public.onlyoffice_user_permissions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  can_view boolean,
  can_edit boolean,
  can_download boolean,
  can_print boolean,
  can_comment boolean,
  can_review boolean,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT onlyoffice_user_edit_requires_view CHECK (can_edit IS DISTINCT FROM true OR can_view IS DISTINCT FROM false)
);

CREATE TABLE IF NOT EXISTS public.onlyoffice_permission_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_type text NOT NULL CHECK (target_type IN ('role', 'user')),
  target_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onlyoffice_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onlyoffice_user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onlyoffice_permission_audit ENABLE ROW LEVEL SECURITY;

-- Les ACL par défaut du projet accordent des droits larges à anon sur les nouvelles tables.
-- On retire explicitement tout accès anonyme et on accorde uniquement le nécessaire à authenticated.
REVOKE ALL ON TABLE
  public.onlyoffice_role_permissions,
  public.onlyoffice_user_permissions,
  public.onlyoffice_permission_audit
FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.onlyoffice_role_permissions, public.onlyoffice_user_permissions
TO authenticated;
GRANT SELECT ON TABLE public.onlyoffice_permission_audit TO authenticated;
REVOKE ALL ON SEQUENCE public.onlyoffice_permission_audit_id_seq FROM PUBLIC, anon, authenticated;


DROP POLICY IF EXISTS "Admins manage ONLYOFFICE role permissions" ON public.onlyoffice_role_permissions;
CREATE POLICY "Admins manage ONLYOFFICE role permissions"
ON public.onlyoffice_role_permissions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'));

DROP POLICY IF EXISTS "Admins manage ONLYOFFICE user permissions" ON public.onlyoffice_user_permissions;
CREATE POLICY "Admins manage ONLYOFFICE user permissions"
ON public.onlyoffice_user_permissions FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'));

DROP POLICY IF EXISTS "Admins read ONLYOFFICE permission audit" ON public.onlyoffice_permission_audit;
CREATE POLICY "Admins read ONLYOFFICE permission audit"
ON public.onlyoffice_permission_audit FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role::text = 'admin'));

CREATE OR REPLACE FUNCTION public.audit_onlyoffice_permission_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.onlyoffice_permission_audit(actor_id, target_type, target_id, action, old_values, new_values)
  VALUES (
    auth.uid(),
    CASE WHEN TG_TABLE_NAME = 'onlyoffice_role_permissions' THEN 'role' ELSE 'user' END,
    CASE WHEN TG_OP = 'DELETE' THEN
      COALESCE(to_jsonb(OLD)->>'role', to_jsonb(OLD)->>'user_id')
    ELSE
      COALESCE(to_jsonb(NEW)->>'role', to_jsonb(NEW)->>'user_id')
    END,
    lower(TG_OP),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- La fonction SECURITY DEFINER n'est appelée que par les triggers ; elle ne doit pas être exposée comme RPC.
REVOKE ALL ON FUNCTION public.audit_onlyoffice_permission_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS audit_onlyoffice_role_permissions ON public.onlyoffice_role_permissions;
CREATE TRIGGER audit_onlyoffice_role_permissions
AFTER INSERT OR UPDATE OR DELETE ON public.onlyoffice_role_permissions
FOR EACH ROW EXECUTE FUNCTION public.audit_onlyoffice_permission_change();

DROP TRIGGER IF EXISTS audit_onlyoffice_user_permissions ON public.onlyoffice_user_permissions;
CREATE TRIGGER audit_onlyoffice_user_permissions
AFTER INSERT OR UPDATE OR DELETE ON public.onlyoffice_user_permissions
FOR EACH ROW EXECUTE FUNCTION public.audit_onlyoffice_permission_change();

-- Préserve les droits actuellement autorisés par ONLYOFFICE_ALLOWED_ROLES.
INSERT INTO public.onlyoffice_role_permissions
  (role, can_view, can_edit, can_download, can_print, can_comment, can_review)
VALUES
  ('admin', true, true, true, true, true, true),
  ('representant', true, true, true, true, true, true),
  ('gestionnaire_documents', true, true, true, true, true, true)
ON CONFLICT (role) DO NOTHING;
