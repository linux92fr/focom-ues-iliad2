-- Avent : pseudo obligatoire pour pouvoir jouer.
-- Objectif anti-triche : chaque partie enregistrée est rattachée à un pseudo
-- unique (contrainte pseudo_lower). Sans pseudo, impossible d'enregistrer une
-- progression : les essais « anonymes » depuis plusieurs terminaux ne peuvent
-- plus alimenter une entrée de classement.

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
  v_pseudo text;
BEGIN
  IF p_player_id IS NULL OR p_day IS NULL OR p_day < 1 OR p_day > 24 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'day');
  END IF;
  SELECT banned, pseudo INTO v_banned, v_pseudo
    FROM public.avent_players WHERE player_id = p_player_id;
  IF coalesce(v_banned, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned');
  END IF;
  -- Pseudo obligatoire : un joueur non identifié ne peut pas enregistrer de partie.
  IF v_pseudo IS NULL OR btrim(v_pseudo) = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'pseudo_required');
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
