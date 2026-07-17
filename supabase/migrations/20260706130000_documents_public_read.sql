-- Jusqu'ici document_categories n'avait aucune policy de lecture, et documents seulement
-- une lecture "mes propres uploads" : la page publique /documents-utiles et l'espace
-- adhérent ne pouvaient afficher aucun document qui n'était pas le leur. On ouvre la
-- lecture des catégories (contenu non sensible) et des documents non archivés à tous
-- (anon + authenticated) ; un document archivé reste réservé aux rôles de gestion et à
-- son propriétaire (déjà couvert par les policies existantes).
DROP POLICY IF EXISTS "Public can view categories" ON public.document_categories;
CREATE POLICY "Public can view categories"
ON public.document_categories FOR SELECT TO public
USING (true);

DROP POLICY IF EXISTS "Public can view non-archived documents" ON public.documents;
CREATE POLICY "Public can view non-archived documents"
ON public.documents FOR SELECT TO public
USING (is_archived = false);
