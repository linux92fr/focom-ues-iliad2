-- Avent : email de contact optionnel pour la remise des lots
-- Finalité unique : contacter le joueur s'il figure parmi les gagnants.
ALTER TABLE public.avent_players ADD COLUMN IF NOT EXISTS contact_email text;

CREATE OR REPLACE FUNCTION public.avent_set_contact(p_player_id uuid, p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_email text;
  v_banned boolean;
BEGIN
  SELECT banned INTO v_banned FROM public.avent_players WHERE player_id = p_player_id;
  IF coalesce(v_banned, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'banned');
  END IF;
  v_email := btrim(p_email);
  IF v_email = '' THEN
    -- retrait volontaire de l'email de contact
    UPDATE public.avent_players
      SET contact_email = NULL, updated_at = now()
      WHERE player_id = p_player_id;
    RETURN jsonb_build_object('ok', true, 'email', NULL);
  END IF;
  IF length(v_email) > 254
     OR v_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  UPDATE public.avent_players
    SET contact_email = lower(v_email), updated_at = now()
    WHERE player_id = p_player_id;
  IF NOT FOUND THEN
    -- pas encore de pseudo : l'email ne peut pas être attaché
    RETURN jsonb_build_object('ok', false, 'error', 'no_pseudo');
  END IF;
  RETURN jsonb_build_object('ok', true, 'email', lower(v_email));
END;
$function$;

-- avent_state renvoie désormais aussi l'email de contact
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
  v_contact text;
BEGIN
  IF p_player_id IS NULL THEN
    RETURN jsonb_build_object('today', public.avent_current_day(), 'played', '{}'::jsonb,
      'pseudo', NULL, 'banned', false, 'contact', NULL);
  END IF;
  SELECT p.pseudo, p.banned, p.contact_email
    INTO v_pseudo, v_banned, v_contact
    FROM public.avent_players p WHERE p.player_id = p_player_id;
  FOR v_row IN SELECT day, correct FROM public.avent_progress WHERE player_id = p_player_id LOOP
    v_played := v_played || jsonb_build_object(v_row.day::text, v_row.correct);
  END LOOP;
  RETURN jsonb_build_object('today', public.avent_current_day(), 'played', v_played,
    'pseudo', v_pseudo, 'banned', coalesce(v_banned, false), 'contact', v_contact);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.avent_set_contact(uuid, text) TO anon, authenticated;
