-- Progression du calendrier de l'Avent côté serveur (joueur anonyme, RGPD :
-- identifiant aléatoire sans donnée personnelle, purge avec les rappels).

CREATE TABLE IF NOT EXISTS public.avent_progress (
  player_id uuid NOT NULL,
  day int NOT NULL CHECK (day BETWEEN 1 AND 24),
  correct boolean NOT NULL,
  played_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, day)
);
ALTER TABLE public.avent_progress ENABLE ROW LEVEL SECURITY;

-- Jour actuellement déverrouillé selon l'heure officielle de Paris (serveur).
CREATE OR REPLACE FUNCTION public.avent_current_day() RETURNS int
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT CASE
    WHEN (now() AT TIME ZONE 'Europe/Paris') < '2026-12-01'::timestamp THEN 0
    WHEN (now() AT TIME ZONE 'Europe/Paris') < '2026-12-25'::timestamp
      THEN EXTRACT(DAY FROM (now() AT TIME ZONE 'Europe/Paris'))::int
    ELSE 25
  END;
$$;

-- État complet du joueur : jour déverrouillé + jours joués.
CREATE OR REPLACE FUNCTION public.avent_state(p_player_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_played jsonb := '{}'::jsonb;
  v_row record;
BEGIN
  IF p_player_id IS NULL THEN
    RETURN jsonb_build_object('today', public.avent_current_day(), 'played', '{}'::jsonb);
  END IF;
  FOR v_row IN SELECT day, correct FROM public.avent_progress WHERE player_id = p_player_id LOOP
    v_played := v_played || jsonb_build_object(v_row.day::text, v_row.correct);
  END LOOP;
  RETURN jsonb_build_object('today', public.avent_current_day(), 'played', v_played);
END;
$$;

-- Enregistrement d'une partie : la date du serveur seule fait foi.
CREATE OR REPLACE FUNCTION public.avent_play(p_player_id uuid, p_day int, p_correct boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_today int := public.avent_current_day();
  v_day_returned int;
  v_correct boolean;
BEGIN
  IF p_player_id IS NULL OR p_day IS NULL OR p_day < 1 OR p_day > 24 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'day');
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
$$;

-- Remise à zéro de la progression du joueur.
CREATE OR REPLACE FUNCTION public.avent_reset(p_player_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM public.avent_progress WHERE player_id = p_player_id;
$$;

GRANT EXECUTE ON FUNCTION public.avent_state(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avent_play(uuid, int, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.avent_reset(uuid) TO anon, authenticated;
