-- Correction des policies Réclamations : le rôle moderator n'existe pas dans l'enum user_role.
-- Les rôles réellement utilisés par le site sont notamment admin, secretaire et representant.

DROP POLICY IF EXISTS "reclamations_user_read" ON storage.objects;
CREATE POLICY "reclamations_user_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'reclamations' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
    )
  );

DROP POLICY IF EXISTS "rec_admin_all" ON reclamations;
CREATE POLICY "rec_admin_all" ON reclamations FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
) WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
);

DROP POLICY IF EXISTS "msg_admin_all" ON reclamation_messages;
CREATE POLICY "msg_admin_all" ON reclamation_messages FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
) WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
);

DROP POLICY IF EXISTS "att_admin_all" ON reclamation_attachments;
CREATE POLICY "att_admin_all" ON reclamation_attachments FOR ALL USING (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
) WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin','secretaire','representant']::public.user_role[])
);
