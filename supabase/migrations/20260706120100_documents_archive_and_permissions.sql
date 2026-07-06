-- Les tables public.documents et public.document_categories existent déjà en production
-- (créées hors suivi Git) mais n'apparaissent dans aucune migration trackée : sur une base
-- rejouée depuis zéro (ex. Supabase Preview Branch), elles n'existent pas encore. On les
-- crée défensivement avec le schéma réel de prod (no-op si déjà présentes) pour que cette
-- migration reste rejouable sur une base neuve.
CREATE TABLE IF NOT EXISTS public.document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text DEFAULT 'folder',
  display_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.document_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.document_categories(id),
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  file_type text,
  uploaded_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Archivage logique des documents (le fichier reste sur Supabase Storage, il est juste masqué).
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES public.profiles(id);

-- Policies "chacun gère ses propres documents", telles qu'existantes en prod.
DROP POLICY IF EXISTS "documents_select_own" ON public.documents;
CREATE POLICY "documents_select_own" ON public.documents
FOR SELECT TO authenticated USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "documents_insert_own" ON public.documents;
CREATE POLICY "documents_insert_own" ON public.documents
FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "documents_update_own" ON public.documents;
CREATE POLICY "documents_update_own" ON public.documents
FOR UPDATE TO authenticated USING (uploaded_by = auth.uid()) WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "documents_delete_own" ON public.documents;
CREATE POLICY "documents_delete_own" ON public.documents
FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

-- Étend la gestion complète des documents/catégories au nouveau rôle gestionnaire_documents,
-- en plus de admin et representant.
DROP POLICY IF EXISTS "Admins and representants can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Admins, representants and gestionnaires can manage documents" ON public.documents;
CREATE POLICY "Admins, representants and gestionnaires can manage documents"
ON public.documents FOR ALL TO public
USING (has_any_role(auth.uid(), ARRAY['admin', 'representant', 'gestionnaire_documents']::user_role[]));

DROP POLICY IF EXISTS "Admins and representants can manage categories" ON public.document_categories;
DROP POLICY IF EXISTS "Admins, representants and gestionnaires can manage categories" ON public.document_categories;
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
DROP POLICY IF EXISTS "Documents storage insert authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Documents storage update own or elevated" ON storage.objects;
DROP POLICY IF EXISTS "Documents storage delete own or elevated" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view documents files" ON storage.objects;

CREATE POLICY "Authenticated users can view documents files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents' AND auth.uid() IS NOT NULL);

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
