-- Ensure the dedicated Smart role exists in the enum used by public.user_roles.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'utilisateur_ia';
