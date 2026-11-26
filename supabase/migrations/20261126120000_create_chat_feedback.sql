-- Table des evaluations (pouce leve / baisse) des reponses de l'assistant juridique.
-- Complète chat_sessions : une ligne par message évalué d'une session de chatbot.
-- Corrige le 404 REST : ChatbotJuridique.tsx fait select puis upsert sur une
-- table qui n'avait jamais été créée (aucune migration ne l'instanciait).

create table if not exists public.chat_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  message_index integer not null check (message_index >= 0),
  rating text not null check (rating in ('up', 'down')),
  created_at timestamptz not null default now(),
  unique (session_id, message_index)
);

comment on table public.chat_feedback is
  'Avis (up/down) sur les réponses de l''assistant juridique, une ligne par message évalué.';

alter table public.chat_feedback enable row level security;

-- Le chatbot juridique est public et anonyme : la session est un UUID généré côté
-- client (localStorage) et accessible à quiconque le connaît, comme chat_sessions.
-- RLS activée + politiques ouvertes à anon/authenticated pour le cycle complet
-- (le composant fait select, upsert on conflict, puis delete à l'annulation).

create policy "chat_feedback_anon_read"
  on public.chat_feedback
  for select
  to anon, authenticated
  using (true);

create policy "chat_feedback_anon_insert"
  on public.chat_feedback
  for insert
  to anon, authenticated
  with check (true);

create policy "chat_feedback_anon_update"
  on public.chat_feedback
  for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "chat_feedback_anon_delete"
  on public.chat_feedback
  for delete
  to anon, authenticated
  using (true);
