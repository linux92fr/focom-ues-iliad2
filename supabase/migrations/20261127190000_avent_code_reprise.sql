-- Avent : code de reprise lié au pseudo.
-- Permet de retrouver sa progression sur un autre appareil en saisissant
-- pseudo + code. Le code est renvoyé en clair une seule fois à l'enregistrement,
-- puis stocké haché en SHA-256 : jamais lisible en base, y compris par l'admin.

ALTER TABLE public.avent_players
  ADD COLUMN IF NOT EXISTS recovery_code_hash text;

-- avent_set_pseudo : génère (ou régénère) un code de reprise de 8 caractères,
-- alphabet sans caractères ambigus (pas de 0/O, 1/I/L), renvoyé au format XXXX-XXXX.
CREATE OR REPLACE FUNCTION public.avent_set_pseudo(p_player_id uuid, p_pseudo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_pseudo text;
  v_check text;
  v_squash text;
  v_banned boolean;
  v_exists boolean;
  v_w text;
  v_code text;
  v_chars text;
  v_i int;
  v_words_exact text[] := ARRAY['con','pute','ntm','fdp','tg','nazi','pd','pede','nique'];
  v_words_part text[] := ARRAY['connard','connasse','salaud','salope','putain','bordel','merde','chiant','encule','enculer','niquer','batard','hitler','negre','youpin','bougnoul','bamboula','raton','tapette'];
BEGIN
  SELECT banned INTO v_banned FROM public.avent_players WHERE player_id = p_player_id;
  IF coalesce(v_banned, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned');
  END IF;
  v_pseudo := btrim(p_pseudo);
  v_pseudo := regexp_replace(v_pseudo, '\s+', ' ', 'g');
  IF length(v_pseudo) < 3 OR length(v_pseudo) > 20
     OR v_pseudo !~ '^[A-Za-z0-9À-ÿ'' -]+$'
     OR v_pseudo ~ '[×÷]' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  v_check := lower(translate(v_pseudo, 'àâäÀÂÄéèêëÉÈÊËîïÎÏôöÔÖùûüÙÛÜçÇ', 'aaaAAAeeeeEEEEiiIIooOOuuuuUUUUcC'));
  v_squash := regexp_replace(v_check, '[^a-z0-9]', '', 'g');
  FOREACH v_w IN ARRAY v_words_exact LOOP
    IF v_check ~ ('\m' || v_w || '\M') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'inappropriate');
    END IF;
  END LOOP;
  FOREACH v_w IN ARRAY v_words_part LOOP
    IF position(v_w in v_squash) > 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'inappropriate');
    END IF;
  END LOOP;
  SELECT EXISTS (
    SELECT 1 FROM public.avent_players
    WHERE pseudo_lower = lower(v_pseudo) AND player_id <> p_player_id
  ) INTO v_exists;
  IF v_exists THEN
    RETURN jsonb_build_object('ok', false, 'error', 'taken');
  END IF;
  -- Génération du code de reprise : 8 caractères tirés d'un alphabet lisible.
  v_chars := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code := '';
  FOR v_i IN 1..8 LOOP
    v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
  END LOOP;
  INSERT INTO public.avent_players (player_id, pseudo, recovery_code_hash)
    VALUES (p_player_id, v_pseudo, encode(sha256(convert_to(v_code, 'UTF8')), 'hex'))
    ON CONFLICT (player_id) DO UPDATE
    SET pseudo = EXCLUDED.pseudo,
        recovery_code_hash = EXCLUDED.recovery_code_hash,
        updated_at = now();
  RETURN jsonb_build_object('ok', true, 'pseudo', v_pseudo,
    'code', substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4));
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'taken');
END;
$function$;

-- Reprise de progression : pseudo + code (le code saisi est normalisé :
-- majuscules, tirets et espaces ignorés) ; renvoie l'identifiant canonique.
CREATE OR REPLACE FUNCTION public.avent_login(p_pseudo text, p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_norm text;
  v_hash text;
  v_player_id uuid;
  v_banned boolean;
BEGIN
  v_norm := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  IF length(v_norm) <> 8 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  v_hash := encode(sha256(convert_to(v_norm, 'UTF8')), 'hex');
  SELECT player_id, banned INTO v_player_id, v_banned
    FROM public.avent_players
    WHERE pseudo_lower = lower(btrim(coalesce(p_pseudo, '')))
      AND recovery_code_hash = v_hash;
  IF v_player_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  IF coalesce(v_banned, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned');
  END IF;
  RETURN jsonb_build_object('ok', true, 'player_id', v_player_id);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.avent_login(text, text) TO anon, authenticated;
