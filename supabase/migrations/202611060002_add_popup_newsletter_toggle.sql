-- Add an opt-out per campaign popup for the shared newsletter subscription form.
-- New and existing popups show the newsletter by default.
ALTER TABLE public.popups
  ADD COLUMN IF NOT EXISTS newsletter_enabled boolean NOT NULL DEFAULT true;
