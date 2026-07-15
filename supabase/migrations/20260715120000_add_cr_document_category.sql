-- Ajoute la catégorie "CR (Compte Rendu)" pour la gestion des documents.
INSERT INTO public.document_categories (name, description, icon, display_order)
SELECT 'CR (Compte Rendu)', 'Comptes rendus de réunions', 'file-text',
  COALESCE((SELECT MAX(display_order) + 1 FROM public.document_categories), 0)
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_categories WHERE name = 'CR (Compte Rendu)'
);
