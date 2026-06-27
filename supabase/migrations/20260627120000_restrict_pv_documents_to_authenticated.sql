-- Restreint la lecture de pv_documents aux seuls utilisateurs authentifiés.
-- Supprime la policy publique qui permettait aux anonymes de lire le contenu des PV.
DROP POLICY IF EXISTS "pv_documents_public_read" ON public.pv_documents;

DROP POLICY IF EXISTS "authenticated_read" ON public.pv_documents;
CREATE POLICY "authenticated_read" ON public.pv_documents
  FOR SELECT TO authenticated
  USING (true);
