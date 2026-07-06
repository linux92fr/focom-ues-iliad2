-- Nouveau rôle dédié à la gestion élargie des documents (upload/organisation/archivage/suppression
-- sur l'ensemble des documents, pas seulement les siens), sans donner les autres droits admin.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'gestionnaire_documents';
