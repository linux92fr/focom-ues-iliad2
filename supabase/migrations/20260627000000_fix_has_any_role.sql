-- Fix: define has_any_role helper and patch policies that used non-existent user_role[] type

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

-- Re-create the storage policy that failed (using text[] instead of user_role[])
DROP POLICY IF EXISTS reclamations_user_read ON storage.objects;
CREATE POLICY "reclamations_user_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reclamations' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_any_role(auth.uid(), ARRAY['admin','secretaire','representant'])
    )
  );
