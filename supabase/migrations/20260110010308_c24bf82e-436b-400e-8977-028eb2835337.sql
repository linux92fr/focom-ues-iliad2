-- Add DELETE policy for profiles table (only admins can delete profiles)
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add CHECK constraints for input validation on all tables

-- Articles table constraints
ALTER TABLE public.articles
ADD CONSTRAINT articles_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT articles_slug_length CHECK (char_length(slug) <= 200),
ADD CONSTRAINT articles_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
ADD CONSTRAINT articles_excerpt_length CHECK (excerpt IS NULL OR char_length(excerpt) <= 500),
ADD CONSTRAINT articles_content_length CHECK (char_length(content) <= 100000),
ADD CONSTRAINT articles_cover_image_format CHECK (cover_image IS NULL OR cover_image ~ '^https?://');

-- News table constraints
ALTER TABLE public.news
ADD CONSTRAINT news_title_length CHECK (char_length(title) <= 200),
ADD CONSTRAINT news_content_length CHECK (char_length(content) <= 100000);

-- Categories table constraints
ALTER TABLE public.categories
ADD CONSTRAINT categories_name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT categories_slug_length CHECK (char_length(slug) <= 100),
ADD CONSTRAINT categories_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
ADD CONSTRAINT categories_description_length CHECK (description IS NULL OR char_length(description) <= 500),
ADD CONSTRAINT categories_color_format CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$');

-- Profiles table constraints
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 100),
ADD CONSTRAINT profiles_phone_length CHECK (phone IS NULL OR char_length(phone) <= 20),
ADD CONSTRAINT profiles_section_length CHECK (section IS NULL OR char_length(section) <= 100),
ADD CONSTRAINT profiles_member_number_length CHECK (member_number IS NULL OR char_length(member_number) <= 50);