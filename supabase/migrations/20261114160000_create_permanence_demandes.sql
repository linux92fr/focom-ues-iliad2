-- Demandes de rendez-vous aux permanences syndicales FO COM
create table if not exists public.permanence_demandes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  entreprise text,
  date_souhaitee date not null,
  sujet text not null,
  message text,
  statut text not null default 'nouvelle' check (statut in ('nouvelle','a_recontacter','confirmee','traitee','annulee')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.permanence_demandes enable row level security;
create policy "permanence_demandes_insert_public"
  on public.permanence_demandes for insert to anon, authenticated
  with check (
    length(trim(nom)) between 1 and 100
    and length(trim(prenom)) between 1 and 100
    and length(trim(email)) between 5 and 254
    and length(trim(sujet)) between 2 and 200
    and (message is null or length(message) <= 2000)
  );
create policy "permanence_demandes_select_admin"
  on public.permanence_demandes for select to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','moderator')));
create policy "permanence_demandes_update_admin"
  on public.permanence_demandes for update to authenticated
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','moderator')))
  with check (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','moderator')));
create index if not exists idx_permanence_demandes_date on public.permanence_demandes(date_souhaitee);
create index if not exists idx_permanence_demandes_created on public.permanence_demandes(created_at desc);
