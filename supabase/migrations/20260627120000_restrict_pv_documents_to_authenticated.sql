-- Restreint la lecture de pv_documents aux seuls utilisateurs authentifiés.
-- Supprime la policy publique qui permettait aux anonymes de lire le contenu des PV.
-- Conditionnel : ne fait rien si la table n'existe pas (preview branch sans données).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'pv_documents'
  ) THEN
    DROP POLICY IF EXISTS "pv_documents_public_read" ON public.pv_documents;
    DROP POLICY IF EXISTS "authenticated_read" ON public.pv_documents;
    CREATE POLICY "authenticated_read" ON public.pv_documents
      FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;
