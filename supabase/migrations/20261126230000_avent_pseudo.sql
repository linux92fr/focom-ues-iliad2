-- Avent : pseudo du joueur, modération et bannissement
-- Table des joueurs : pseudo unique (insensible à la casse), flag banni
CREATE TABLE IF NOT EXISTS public.avent_players (
  player_id uuid PRIMARY KEY,
  pseudo text NOT NULL,
  pseudo_lower text GENERATED ALWAYS AS (lower(pseudo)) STORED,
  banned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pseudo_lower)
);
ALTER TABLE public.avent_players ENABLE ROW LEVEL SECURITY;

-- Enregistrement / modification du pseudo avec validation côté serveur :
-- longueur 3-20, caractères autorisés, liste de mots interdits, unicité.
-- Un joueur banni (modération manuelle) ne peut plus changer de pseudo.
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
  INSERT INTO public.avent_players (player_id, pseudo)
    VALUES (p_player_id, v_pseudo)
    ON CONFLICT (player_id) DO UPDATE
    SET pseudo = EXCLUDED.pseudo, updated_at = now();
  RETURN jsonb_build_object('ok', true, 'pseudo', v_pseudo);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'taken');
END;
$function$;

-- avent_state renvoie désormais aussi le pseudo et le statut banni
CREATE OR REPLACE FUNCTION public.avent_state(p_player_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_played jsonb := '{}'::jsonb;
  v_row record;
  v_pseudo text;
  v_banned boolean;
BEGIN
  IF p_player_id IS NULL THEN
    RETURN jsonb_build_object('today', public.avent_current_day(), 'played', '{}'::jsonb, 'pseudo', NULL, 'banned', false);
  END IF;
  SELECT p.pseudo, p.banned INTO v_pseudo, v_banned
    FROM public.avent_players p WHERE p.player_id = p_player_id;
  FOR v_row IN SELECT day, correct FROM public.avent_progress WHERE player_id = p_player_id LOOP
    v_played := v_played || jsonb_build_object(v_row.day::text, v_row.correct);
  END LOOP;
  RETURN jsonb_build_object('today', public.avent_current_day(), 'played', v_played,
    'pseudo', v_pseudo, 'banned', coalesce(v_banned, false));
END;
$function$;

-- avent_play refuse les joueurs bannis
CREATE OR REPLACE FUNCTION public.avent_play(p_player_id uuid, p_day integer, p_correct boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_today int := public.avent_current_day();
  v_day_returned int;
  v_correct boolean;
  v_banned boolean;
BEGIN
  IF p_player_id IS NULL OR p_day IS NULL OR p_day < 1 OR p_day > 24 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'day');
  END IF;
  SELECT banned INTO v_banned FROM public.avent_players WHERE player_id = p_player_id;
  IF coalesce(v_banned, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned');
  END IF;
  IF p_day > v_today THEN
    RETURN jsonb_build_object('ok', false, 'error', 'locked');
  END IF;
  INSERT INTO public.avent_progress (player_id, day, correct)
    VALUES (p_player_id, p_day, p_correct)
    ON CONFLICT (player_id, day) DO NOTHING
    RETURNING day INTO v_day_returned;
  SELECT correct INTO v_correct FROM public.avent_progress WHERE player_id = p_player_id AND day = p_day;
  RETURN jsonb_build_object('ok', true, 'day', p_day, 'correct', v_correct,
    'alreadyPlayed', v_day_returned IS NULL, 'today', v_today);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.avent_set_pseudo(uuid, text) TO anon, authenticated;
