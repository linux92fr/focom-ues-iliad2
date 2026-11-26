-- Recherche PV : opérateurs booléens
-- ET/AND, OU/OR, SAUF/NOT/-/!, guillemets (expression), parenthèses (regroupement).
-- Les requêtes sans syntaxe booléenne conservent le moteur websearch habituel.

-- 1) Détection de syntaxe booléenne dans une requête
create or replace function public.pv_has_bool_syntax(p_query text)
returns boolean
language sql
immutable
as $$
  select btrim(coalesce(p_query, '')) ~*
    '(\y(AND|OR|NOT|ET|OU|SAUF)\y)|"|\(|(^|[[:space:]])[-!][[:alnum:]_à-ÿ]'
$$;

-- 2) Analyse d'une requête booléenne en chaîne tsquery.
--    Retourne NULL si la requête n'est pas booléenne ou si l'analyse échoue :
--    le moteur bascule alors sur le mode websearch habituel.
create or replace function public.pv_bool_tsquery(p_query text)
returns text
language plpgsql
immutable
as $fn$
declare
  v_src text := btrim(coalesce(p_query, ''));
  v_len int;
  v_pos int := 1;
  v_ch text;
  v_word text;
  v_phrase text;
  v_lower text;
  v_tokens text[] := '{}';
  v_tokens2 text[] := '{}';
  v_tok text;
  v_i int;
  v_j int;
  v_prev text := 'start';
  v_is_operand boolean;
  v_is_not boolean;
  v_frag text;
  v_parts text[];
  v_part text;
  v_sub text;
  v_sym text;
  v_out text[] := '{}';
  v_ops text[] := '{}';
  v_op text;
  v_opc int;
  v_a text;
  v_b text;
  v_expect boolean := true;
begin
  if v_src = '' or not public.pv_has_bool_syntax(v_src) then
    return null;
  end if;

  -- A) Tokenisation : ( ) "expression" -/! ET/AND OU/OR SAUF/NOT mots
  v_len := char_length(v_src);
  while v_pos <= v_len loop
    v_ch := substr(v_src, v_pos, 1);
    if v_ch = '(' then
      v_tokens := array_append(v_tokens, 'LP');
      v_pos := v_pos + 1;
    elsif v_ch = ')' then
      v_tokens := array_append(v_tokens, 'RP');
      v_pos := v_pos + 1;
    elsif v_ch = '"' then
      v_phrase := '';
      v_pos := v_pos + 1;
      while v_pos <= v_len and substr(v_src, v_pos, 1) <> '"' loop
        v_phrase := v_phrase || substr(v_src, v_pos, 1);
        v_pos := v_pos + 1;
      end loop;
      if v_pos <= v_len then
        v_pos := v_pos + 1;
      end if;
      if btrim(v_phrase) <> '' then
        v_tokens := array_append(v_tokens, 'PH:' || btrim(v_phrase));
      end if;
    elsif v_ch in ('-', '!') then
      v_tokens := array_append(v_tokens, 'NOT');
      v_pos := v_pos + 1;
    elsif v_ch ~ '[[:space:]]' then
      v_pos := v_pos + 1;
    else
      v_word := '';
      while v_pos <= v_len loop
        v_ch := substr(v_src, v_pos, 1);
        exit when v_ch = '(' or v_ch = ')' or v_ch = '"' or v_ch ~ '[[:space:]]';
        v_word := v_word || v_ch;
        v_pos := v_pos + 1;
      end loop;
      v_word := btrim(v_word, '.,;:?!…«»''"');
      v_lower := lower(v_word);
      if v_lower in ('and', 'et') then
        v_tokens := array_append(v_tokens, 'AND');
      elsif v_lower in ('or', 'ou') then
        v_tokens := array_append(v_tokens, 'OR');
      elsif v_lower in ('not', 'sauf') then
        v_tokens := array_append(v_tokens, 'NOT');
      elsif v_word <> '' then
        v_tokens := array_append(v_tokens, 'W:' || v_word);
      end if;
    end if;
  end loop;

  -- B) Normalisation du flux : ET implicite entre deux opérandes,
  --    « a SAUF b » devient « a ET NON b »
  for v_i in 1..coalesce(array_length(v_tokens, 1), 0) loop
    v_tok := v_tokens[v_i];
    v_is_operand := v_tok like 'W:%' or v_tok like 'PH:%';
    v_is_not := (v_tok = 'NOT');
    if v_is_operand or v_is_not or v_tok = 'LP' then
      if v_prev in ('operand', 'rp') then
        v_tokens2 := array_append(v_tokens2, 'AND');
      end if;
      v_tokens2 := array_append(v_tokens2, v_tok);
      v_prev := case when v_tok = 'LP' then 'lp' when v_is_not then 'not' else 'operand' end;
    elsif v_tok = 'AND' or v_tok = 'OR' then
      if v_prev not in ('operand', 'rp') then
        return null;
      end if;
      v_tokens2 := array_append(v_tokens2, v_tok);
      v_prev := 'op';
    elsif v_tok = 'RP' then
      if v_prev not in ('operand', 'rp') then
        return null;
      end if;
      v_tokens2 := array_append(v_tokens2, v_tok);
      v_prev := 'rp';
    end if;
  end loop;

  if v_prev not in ('operand', 'rp') then
    return null;
  end if;

  -- C) Shunting-yard vers une chaîne tsquery bien parenthésée
  v_expect := true;
  for v_i in 1..coalesce(array_length(v_tokens2, 1), 0) loop
    v_tok := v_tokens2[v_i];

    if v_tok like 'W:%' or v_tok like 'PH:%' then
      v_sub := case when v_tok like 'W:%' then substr(v_tok, 3) else substr(v_tok, 4) end;
      v_parts := regexp_split_to_array(lower(v_sub), '['' -]+');
      v_frag := '';
      for v_j in 1..coalesce(array_length(v_parts, 1), 0) loop
        v_part := v_parts[v_j];
        if v_part ~ '[[:alnum:]]' then
          v_frag := case when v_frag = '' then v_part else v_frag || ' & ' || v_part end;
        end if;
      end loop;
      if v_frag = '' then
        return null;
      end if;
      v_out := array_append(v_out, v_frag);
      v_expect := false;

    elsif v_tok = 'NOT' then
      v_ops := array_append(v_ops, 'NOT');
      v_expect := true;

    elsif v_tok = 'AND' or v_tok = 'OR' then
      if v_expect then
        return null;
      end if;
      loop
        v_opc := coalesce(array_length(v_ops, 1), 0);
        exit when v_opc = 0;
        v_op := v_ops[v_opc];
        exit when v_op = 'LP';
        if (v_tok = 'AND' and v_op in ('NOT', 'AND'))
           or (v_tok = 'OR' and v_op in ('NOT', 'AND', 'OR')) then
          if v_op = 'NOT' then
            if coalesce(array_length(v_out, 1), 0) < 1 then return null; end if;
            v_a := v_out[coalesce(array_length(v_out, 1), 0)];
            v_out := v_out[1:array_length(v_out, 1) - 1];
            v_out := array_append(v_out, '!(' || v_a || ')');
          else
            if coalesce(array_length(v_out, 1), 0) < 2 then return null; end if;
            v_b := v_out[coalesce(array_length(v_out, 1), 0)];
            v_out := v_out[1:array_length(v_out, 1) - 1];
            v_a := v_out[coalesce(array_length(v_out, 1), 0)];
            v_out := v_out[1:array_length(v_out, 1) - 1];
            v_sym := case when v_op = 'OR' then '|' else '&' end;
            v_out := array_append(v_out, '(' || v_a || ' ' || v_sym || ' ' || v_b || ')');
          end if;
          v_ops := v_ops[1:v_opc - 1];
        else
          exit;
        end if;
      end loop;
      v_ops := array_append(v_ops, v_tok);
      v_expect := true;

    elsif v_tok = 'LP' then
      v_ops := array_append(v_ops, 'LP');
      v_expect := true;

    elsif v_tok = 'RP' then
      if v_expect then
        return null;
      end if;
      loop
        v_opc := coalesce(array_length(v_ops, 1), 0);
        if v_opc = 0 then
          return null;
        end if;
        v_op := v_ops[v_opc];
        exit when v_op = 'LP';
        if v_op = 'NOT' then
          if coalesce(array_length(v_out, 1), 0) < 1 then return null; end if;
          v_a := v_out[coalesce(array_length(v_out, 1), 0)];
          v_out := v_out[1:array_length(v_out, 1) - 1];
          v_out := array_append(v_out, '!(' || v_a || ')');
        else
          if coalesce(array_length(v_out, 1), 0) < 2 then return null; end if;
          v_b := v_out[coalesce(array_length(v_out, 1), 0)];
          v_out := v_out[1:array_length(v_out, 1) - 1];
          v_a := v_out[coalesce(array_length(v_out, 1), 0)];
          v_out := v_out[1:array_length(v_out, 1) - 1];
          v_sym := case when v_op = 'OR' then '|' else '&' end;
          v_out := array_append(v_out, '(' || v_a || ' ' || v_sym || ' ' || v_b || ')');
        end if;
        v_ops := v_ops[1:v_opc - 1];
      end loop;
      v_ops := v_ops[1:coalesce(array_length(v_ops, 1), 0) - 1];
      v_expect := false;
    end if;
  end loop;

  if v_expect then
    return null;
  end if;

  -- dépiler les opérateurs restants
  loop
    v_opc := coalesce(array_length(v_ops, 1), 0);
    exit when v_opc = 0;
    v_op := v_ops[v_opc];
    if v_op = 'LP' then
      return null;
    end if;
    if v_op = 'NOT' then
      if coalesce(array_length(v_out, 1), 0) < 1 then return null; end if;
      v_a := v_out[coalesce(array_length(v_out, 1), 0)];
      v_out := v_out[1:array_length(v_out, 1) - 1];
      v_out := array_append(v_out, '!(' || v_a || ')');
    else
      if coalesce(array_length(v_out, 1), 0) < 2 then return null; end if;
      v_b := v_out[coalesce(array_length(v_out, 1), 0)];
      v_out := v_out[1:array_length(v_out, 1) - 1];
      v_a := v_out[coalesce(array_length(v_out, 1), 0)];
      v_out := v_out[1:array_length(v_out, 1) - 1];
      v_sym := case when v_op = 'OR' then '|' else '&' end;
      v_out := array_append(v_out, '(' || v_a || ' ' || v_sym || ' ' || v_b || ')');
    end if;
    v_ops := v_ops[1:v_opc - 1];
  end loop;

  if coalesce(array_length(v_out, 1), 0) <> 1 then
    return null;
  end if;

  return v_out[1];
end;
$fn$;

-- 3) Conversion sûre : requête booléenne -> tsquery, avec repli websearch
create or replace function public.pv_query_to_tsquery(p_query text)
returns tsquery
language plpgsql
stable
as $fn$
declare
  v_bool text;
begin
  v_bool := public.pv_bool_tsquery(p_query);
  if v_bool is null or btrim(v_bool) = '' then
    return websearch_to_tsquery('public.french_unaccent'::regconfig, coalesce(p_query, ''));
  end if;
  return to_tsquery('public.french_unaccent'::regconfig, v_bool);
exception when others then
  return websearch_to_tsquery('public.french_unaccent'::regconfig, coalesce(p_query, ''));
end;
$fn$;

-- 4) pv_search v2 : gestion des requêtes booléennes.
--    - étage « expression exacte » : requête entière, ou expression entre
--      guillemets si la requête est booléenne ;
--    - étage plein texte : tsquery booléenne si syntaxe détectée,
--      sinon websearch comme auparavant ;
--    - étage flou : désactivé pour les requêtes booléennes.
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
      nullif(btrim(coalesce(p_type, '')), '') as v_type,
      public.pv_has_bool_syntax(left(btrim(coalesce(p_query, '')), 200)) as v_bool,
      public.pv_query_to_tsquery(left(btrim(coalesce(p_query, '')), 200)) as v_tsquery,
      public.immutable_unaccent(lower(coalesce(
        (select (regexp_match(left(btrim(coalesce(p_query, '')), 200), '"([^"]+)"'))[1]),
        case when not public.pv_has_bool_syntax(left(btrim(coalesce(p_query, '')), 200))
             then left(btrim(coalesce(p_query, '')), 200) end
      ))) as v_phrase_norm
  ),
  phrase as (
    select d.filename, d.original_filename, d.content, d.chunk_index, 1.5::real as score
    from public.pv_documents d
    cross join q
    where q.v_phrase_norm is not null
      and q.v_phrase_norm <> ''
      and (q.v_type is null or d.filename like q.v_type || '/%')
      and public.immutable_unaccent(lower(d.content)) like '%' || q.v_phrase_norm || '%'
    limit 60
  ),
  fts as (
    select d.filename, d.original_filename, d.content, d.chunk_index,
           (0.5 + 2.0 * ts_rank_cd(
             to_tsvector('public.french_unaccent'::regconfig, d.content),
             q.v_tsquery
           ))::real as score
    from public.pv_documents d
    cross join q
    where q.v_query <> ''
      and (q.v_type is null or d.filename like q.v_type || '/%')
      and to_tsvector('public.french_unaccent'::regconfig, d.content) @@ q.v_tsquery
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
      and not q.v_bool
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
  limit (select v_count from q);
$$;
