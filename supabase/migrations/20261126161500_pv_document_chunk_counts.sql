-- Comptage des sections indexées par fichier.
-- L'API Supabase (PostgREST) plafonne les réponses à 1000 lignes : la page
-- admin passe par cette RPC d'agrégation pour connaître l'état d'indexation
-- de chaque fichier (1 ligne par fichier au lieu d'1 ligne par section).
CREATE OR REPLACE FUNCTION public.pv_document_chunk_counts()
RETURNS TABLE (filename text, chunks bigint)
LANGUAGE sql STABLE
AS $$
  SELECT p.filename, count(*)::bigint AS chunks
  FROM public.pv_documents p
  GROUP BY p.filename
$$;

REVOKE EXECUTE ON FUNCTION public.pv_document_chunk_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pv_document_chunk_counts() TO authenticated;
