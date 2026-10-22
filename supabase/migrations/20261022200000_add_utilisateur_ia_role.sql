-- The application role is stored in public.user_role (used by user_roles.role).
-- Keep app_role compatible if it exists, but add the dedicated role to the actual column enum.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'utilisateur_ia';
