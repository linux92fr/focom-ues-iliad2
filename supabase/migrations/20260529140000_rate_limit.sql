-- LOW-3: rate limiting for WebAuthn endpoints
-- Uses a sliding-window log table + security-definer function callable from edge functions

create table if not exists public.rate_limit_log (
  id        bigserial primary key,
  key       text        not null,  -- IP address or user_id
  action    text        not null,  -- e.g. 'webauthn-authenticate', 'webauthn-register'
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_log_key_action_created
  on public.rate_limit_log (key, action, created_at);

alter table public.rate_limit_log enable row level security;

-- Only service_role (edge functions) can read/write this table
create policy "service_rate_limit_log"
  on public.rate_limit_log for all to service_role
  using (true) with check (true);

-- Returns true if the request is allowed, false if the limit is reached.
-- Also inserts the current attempt and cleans up old entries.
create or replace function public.check_rate_limit(
  p_key            text,
  p_action         text,
  p_max_requests   int,
  p_window_minutes int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_since timestamptz;
begin
  v_since := now() - (p_window_minutes || ' minutes')::interval;

  -- Purge old entries for this key+action to keep the table small
  delete from public.rate_limit_log
  where key = p_key and action = p_action and created_at < v_since;

  -- Count remaining attempts in the current window
  select count(*) into v_count
  from public.rate_limit_log
  where key = p_key and action = p_action and created_at >= v_since;

  if v_count >= p_max_requests then
    return false;
  end if;

  insert into public.rate_limit_log (key, action) values (p_key, p_action);
  return true;
end;
$$;

grant execute on function public.check_rate_limit(text, text, int, int) to service_role;
