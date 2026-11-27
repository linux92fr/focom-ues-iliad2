-- Améliore handle_new_user : extraction du prénom/nom et de l'avatar depuis
-- les métadonnées des fournisseurs OAuth (Facebook : full_name, name, avatar_url),
-- et depuis display_name pour les inscriptions classiques par email.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_full_name TEXT;
  v_parts TEXT[];
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Log pour déboguer
  RAISE LOG 'Trigger handle_new_user appelé pour user_id: %', NEW.id;

  -- Nom complet : métadonnées OAuth (Facebook, Google...) ou display_name (email)
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name'
  );
  v_parts := string_to_array(btrim(v_full_name), ' ');

  v_first_name := COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'firstName',
    v_parts[1],
    split_part(NEW.email, '@', 1)
  );

  v_last_name := COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'lastName',
    CASE WHEN array_length(v_parts, 1) > 1
      THEN array_to_string(v_parts[2:array_length(v_parts, 1)], ' ')
      ELSE ''
    END
  );

  INSERT INTO public.profiles (id, email, first_name, last_name, status, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_first_name,
    v_last_name,
    'actif',
    NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE LOG 'Profil créé avec succès pour user_id: %, email: %', NEW.id, NEW.email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erreur dans handle_new_user pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;