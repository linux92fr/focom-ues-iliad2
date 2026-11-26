-- Politique UPDATE manquante sur le bucket pv-documents.
-- Le remplacement d'un fichier existant (upsert du dépôt admin) échouait avec
-- « new row violates row-level security policy » : les politiques lecture /
-- insertion / suppression existaient, mais pas la mise à jour. Cette politique
-- est alignée sur les existantes (utilisateur authentifié, bucket pv-documents).
create policy pv_documents_storage_update
  on storage.objects
  for update
  to public
  using ((bucket_id = 'pv-documents'::text) and (auth.role() = 'authenticated'::text))
  with check ((bucket_id = 'pv-documents'::text) and (auth.role() = 'authenticated'::text));
