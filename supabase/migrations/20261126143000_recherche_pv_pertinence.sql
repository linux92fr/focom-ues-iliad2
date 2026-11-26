-- Recherche PV : moteur de pertinence (accents, classement, tolérance aux fautes)
--
-- 1. Extensions unaccent + pg_trgm
-- 2. Wrapper immutable_unaccent (utilisable dans les index d'expression)
-- 3. Configuration de recherche français sans accents : french_unaccent
-- 4. Index GIN plein texte (french_unaccent) et trigrammes (texte sans accents)
-- 5. Fonction pv_search(p_query, p_match_count, p_type) : classe les résultats
--    (expression exacte > pertinence plein texte > rapprochement flou),
--    ignore les accents et tolère les fautes de frappe.

create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- Wrapper IMMUTABLE de unaccent (requis pour les index d'expression)
create or replace function public.immutable_unaccent(p_text text)
returns text
language sql
immutable
strict
as $$
  select unaccent('unaccent'::regdictionary, p_text);
$$;

-- Configuration française sans accents
do $do$
begin
  if not exists (select 1 from pg_ts_config where cfgname = 'french_unaccent') then
    create text search configuration public.french_unaccent (copy = french);
  end if;
end
$do$;

alter text search configuration public.french_unaccent
  alter mapping for hword, hword_part, word
  with unaccent, french_stem;

-- Index plein texte sans accents
create index if not exists pv_documents_fts_unaccent
  on public.pv_documents
  using gin (to_tsvector('public.french_unaccent'::regconfig, content));

-- Index trigrammes pour la recherche d'expression et le rapprochement flou
create index if not exists pv_documents_trgm_unaccent
  on public.pv_documents
  using gin (public.immutable_unaccent(lower(content)) gin_trgm_ops);

-- Fonction de recherche classée par pertinence :
--   1) tranches contenant l'expression exacte (sans accents)
--   2) pertinence plein texte (websearch, français sans accents)
--   3) rapprochement flou (fautes de frappe) si pas assez de résultats
create or replace function public.pv_search(
  p_query text,
  p_match_count int default 15,
  p_type text default null
)
returns table (
  filename text,
  original_filename text,
  content text,
  chunk_index int,
  similarity real
)
language sql
stable
as $$
  with q as (
    select
      left(btrim(coalesce(p_query, '')), 200) as v_query,
      public.immutable_unaccent(lower(left(btrim(coalesce(p_query, '')), 200))) as v_norm,
      least(coalesce(nullif(p_match_count, 0), 15), 20) as v_count,
      nullif(btrim(coalesce(p_type, '')), '') as v_type
  ),
  phrase as (
    select d.filename, d.original_filename, d.content, d.chunk_index, 1.5::real as score
    from public.pv_documents d
    cross join q
    where q.v_query <> ''
      and q.v_norm <> ''
      and (q.v_type is null or d.filename like q.v_type || '/%')
      and public.immutable_unaccent(lower(d.content)) like '%' || q.v_norm || '%'
    limit 60
  ),
  fts as (
    select d.filename, d.original_filename, d.content, d.chunk_index,
           (0.5 + 2.0 * ts_rank_cd(
             to_tsvector('public.french_unaccent'::regconfig, d.content),
             websearch_to_tsquery('public.french_unaccent'::regconfig, q.v_query)
           ))::real as score
    from public.pv_documents d
    cross join q
    where q.v_query <> ''
      and (q.v_type is null or d.filename like q.v_type || '/%')
      and to_tsvector('public.french_unaccent'::regconfig, d.content)
          @@ websearch_to_tsquery('public.french_unaccent'::regconfig, q.v_query)
    limit 200
  ),
  base as (
    select * from phrase
    union all
    select * from fts
  ),
  fuzzy as (
    select d.filename, d.original_filename, d.content, d.chunk_index,
           (word_similarity(q.v_norm, public.immutable_unaccent(lower(d.content))) * 0.4)::real as score
    from public.pv_documents d
    cross join q
    where q.v_query <> ''
      and char_length(q.v_norm) >= 3
      and (q.v_type is null or d.filename like q.v_type || '/%')
      and (select count(*) from base) < q.v_count
      and word_similarity(q.v_norm, public.immutable_unaccent(lower(d.content))) > 0.45
    limit 200
  ),
  combined as (
    select * from base
    union all
    select * from fuzzy
  ),
  ranked as (
    select distinct on (c.filename, c.chunk_index)
      c.filename, c.original_filename, c.content, c.chunk_index, c.score as similarity
    from combined c
    order by c.filename, c.chunk_index, c.score desc
  )
  select r.filename, r.original_filename, r.content, r.chunk_index, r.similarity
  from ranked r
  cross join q
  order by r.similarity desc, r.chunk_index asc, r.filename asc
  limit q.v_count;
$$;
