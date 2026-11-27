-- Classement honorifique de l'Avent : reconnaissance uniquement, aucun lot matériel.
-- Deux fonctions : avent_leaderboard (top public des pseudos) et avent_my_rank (rang du joueur).

-- Top N des meilleurs joueurs (pseudos non bannis uniquement, score identique au front :
-- 10 points par jour réussi, 20 pour le jour 24, tri par score puis jours joués).
create or replace function public.avent_leaderboard(p_limit int default 10)
returns table (rank int, pseudo text, score int, days int)
language sql
stable
security definer
set search_path = public
as $$
  with scores as (
    select
      p.player_id,
      p.pseudo,
      sum(case when pr.correct then case when pr.day = 24 then 20 else 10 end else 0 end) as score,
      count(*) as days
    from public.avent_players p
    join public.avent_progress pr on pr.player_id = p.player_id
    where p.banned = false and coalesce(p.pseudo, '') <> ''
    group by p.player_id, p.pseudo
  )
  select
    row_number() over (order by score desc, days desc)::int,
    scores.pseudo::text,
    scores.score::int,
    scores.days::int
  from scores
  order by score desc, days desc
  limit least(greatest(coalesce(p_limit, 10), 1), 50)
$$;

-- Rang du joueur parmi tous les participants ayant joué au moins une fois.
-- Aucune donnée personnelle : pseudo renvoyé seulement si le joueur n'est pas banni.
create or replace function public.avent_my_rank(p_player_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with scores as (
    select
      pr.player_id,
      sum(case when pr.correct then case when pr.day = 24 then 20 else 10 end else 0 end) as score,
      count(*) as days
    from public.avent_progress pr
    join public.avent_players pl on pl.player_id = pr.player_id and pl.banned = false
    group by pr.player_id
  )
  select jsonb_build_object(
    'score', coalesce((select score from scores where player_id = p_player_id), 0),
    'days', coalesce((select days from scores where player_id = p_player_id), 0),
    'rank', (select count(*) + 1 from scores s
             where s.score > coalesce((select score from scores where player_id = p_player_id), 0)),
    'total', (select count(*) from scores),
    'completed', coalesce((select days from scores where player_id = p_player_id), 0) >= 24,
    'pseudo', (select p.pseudo from public.avent_players p
               where p.player_id = p_player_id and p.banned = false)
  )
$$;

grant execute on function public.avent_leaderboard(int) to anon, authenticated;
grant execute on function public.avent_my_rank(uuid) to anon, authenticated;
