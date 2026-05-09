-- Tables pour le système de permanences syndicales FOCOM

-- Créneaux de permanence proposés par les délégués
create table if not exists public.permanences (
  id uuid primary key default gen_random_uuid(),
  delegue_id uuid references public.profiles(id) on delete set null,
  delegue_nom text not null,
  delegue_email text,
  type text not null default 'individuelle', -- 'individuelle' | 'collective'
  titre text not null,
  description text,
  date_permanence date not null,
  heure_debut time not null,
  heure_fin time not null,
  lieu text,
  visio_lien text,
  capacite integer not null default 1,
  nb_reservations integer not null default 0,
  statut text not null default 'ouverte', -- 'ouverte' | 'complete' | 'annulee'
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Réservations des adhérents
create table if not exists public.permanence_rdv (
  id uuid primary key default gen_random_uuid(),
  permanence_id uuid not null references public.permanences(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  user_nom text,
  sujet text not null,
  message text,
  statut text not null default 'en_attente', -- 'en_attente' | 'confirme' | 'annule' | 'effectue'
  note_delegue text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(permanence_id, user_id)
);

-- Triggers updated_at
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger permanences_updated_at
  before update on public.permanences
  for each row execute function public.update_updated_at_column();

create trigger permanence_rdv_updated_at
  before update on public.permanence_rdv
  for each row execute function public.update_updated_at_column();

-- Trigger pour maintenir nb_reservations à jour
create or replace function public.sync_nb_reservations()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' and NEW.statut != 'annule' then
    update public.permanences
    set nb_reservations = nb_reservations + 1,
        statut = case when nb_reservations + 1 >= capacite then 'complete' else 'ouverte' end
    where id = NEW.permanence_id;
  elsif TG_OP = 'UPDATE' then
    if OLD.statut != 'annule' and NEW.statut = 'annule' then
      update public.permanences
      set nb_reservations = greatest(0, nb_reservations - 1),
          statut = case when statut = 'complete' then 'ouverte' else statut end
      where id = NEW.permanence_id;
    elsif OLD.statut = 'annule' and NEW.statut != 'annule' then
      update public.permanences
      set nb_reservations = nb_reservations + 1,
          statut = case when nb_reservations + 1 >= capacite then 'complete' else statut end
      where id = NEW.permanence_id;
    end if;
  elsif TG_OP = 'DELETE' and OLD.statut != 'annule' then
    update public.permanences
    set nb_reservations = greatest(0, nb_reservations - 1),
        statut = case when statut = 'complete' then 'ouverte' else statut end
    where id = OLD.permanence_id;
  end if;
  return coalesce(NEW, OLD);
end;
$$;

create trigger sync_nb_reservations_trigger
  after insert or update or delete on public.permanence_rdv
  for each row execute function public.sync_nb_reservations();

-- RLS
alter table public.permanences enable row level security;
alter table public.permanence_rdv enable row level security;

-- Permanences : lecture publique pour les permanences publiées
create policy "permanences_select_public"
  on public.permanences for select
  using (published = true);

-- Permanences : gestion par admins/modérateurs
create policy "permanences_all_admin"
  on public.permanences for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- RDV : lecture par le propriétaire ou admin
create policy "permanence_rdv_select_owner"
  on public.permanence_rdv for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- RDV : insertion par tout utilisateur connecté
create policy "permanence_rdv_insert_auth"
  on public.permanence_rdv for insert
  with check (user_id = auth.uid());

-- RDV : mise à jour par le propriétaire (annulation) ou admin
create policy "permanence_rdv_update_owner"
  on public.permanence_rdv for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'moderator')
    )
  );

-- Index pour les performances
create index if not exists idx_permanences_date on public.permanences(date_permanence);
create index if not exists idx_permanences_statut on public.permanences(statut);
create index if not exists idx_permanence_rdv_user on public.permanence_rdv(user_id);
create index if not exists idx_permanence_rdv_permanence on public.permanence_rdv(permanence_id);
