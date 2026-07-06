-- Archivage logique des documents (le fichier reste sur Supabase Storage, il est juste masqué).
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES public.profiles(id);

-- Étend la gestion complète des documents/catégories au nouveau rôle gestionnaire_documents,
-- en plus de admin et representant.
DROP POLICY IF EXISTS "Admins and representants can manage documents" ON public.documents;
CREATE POLICY "Admins, representants and gestionnaires can manage documents"
ON public.documents FOR ALL TO public
USING (has_any_role(auth.uid(), ARRAY['admin', 'representant', 'gestionnaire_documents']::user_role[]));

DROP POLICY IF EXISTS "Admins and representants can manage categories" ON public.document_categories;
CREATE POLICY "Admins, representants and gestionnaires can manage categories"
ON public.document_categories FOR ALL TO public
USING (has_any_role(auth.uid(), ARRAY['admin', 'representant', 'gestionnaire_documents']::user_role[]));

-- Corrige le bucket storage "documents" : jusqu'ici n'importe quel utilisateur authentifié
-- pouvait modifier/supprimer n'importe quel fichier, et la lecture était publique sans
-- vérification d'authentification. On aligne le storage sur les règles de la table :
-- gestion complète pour admin/representant/gestionnaire_documents, sinon uniquement ses
-- propres fichiers (retrouvés via documents.uploaded_by).
DROP POLICY IF EXISTS "Admins and representants can delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and representants can update documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins and representants can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Documents authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Documents authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Documents authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Documents public read" ON storage.objects;

CREATE POLICY "Documents storage insert authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Documents storage update own or elevated"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND (
    has_any_role(auth.uid(), ARRAY['admin', 'representant', 'gestionnaire_documents']::user_role[])
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = storage.objects.name AND d.uploaded_by = auth.uid()
    )
  )
);

CREATE POLICY "Documents storage delete own or elevated"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND (
    has_any_role(auth.uid(), ARRAY['admin', 'representant', 'gestionnaire_documents']::user_role[])
    OR EXISTS (
      SELECT 1 FROM public.documents d
      WHERE d.file_path = storage.objects.name AND d.uploaded_by = auth.uid()
    )
  )
);
-- Note : la lecture reste régie par la policy existante "Authenticated users can view
-- documents files" (auth.uid() IS NOT NULL), qui n'est pas modifiée ici.
