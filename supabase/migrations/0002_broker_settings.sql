-- Stores broker API credentials + which broker is currently active.
-- Edited from the app's Settings screen, read by the edge function at poll time.
-- Only one row should ever be "active" per broker slot; we keep one row per broker
-- and a separate `active_broker` row to say which one is live.

create table if not exists broker_settings (
  id bigint generated always as identity primary key,
  broker text not null unique check (broker in ('DHAN', 'ANGELONE')),
  is_active boolean not null default false,
  -- Dhan fields
  dhan_client_id text,
  dhan_access_token text,
  -- Angel One fields
  angel_api_key text,
  angel_client_code text,
  angel_password text,
  angel_totp_secret text,
  angel_access_token text,
  -- shared
  developer_mode boolean not null default false,
  poll_interval_seconds int not null default 5,
  max_points int not null default 0, -- 0 = unlimited
  updated_at timestamptz not null default now()
);

alter table broker_settings enable row level security;

-- App (anon key) can read + update its own broker settings directly from the
-- Settings screen. Lock this down further (e.g. behind Supabase Auth) before
-- going to production with real money.
create policy "Allow public read settings" on broker_settings
  for select using (true);

create policy "Allow public update settings" on broker_settings
  for update using (true);

create policy "Allow public insert settings" on broker_settings
  for insert with check (true);

insert into broker_settings (broker, is_active)
values ('DHAN', true), ('ANGELONE', false)
on conflict (broker) do nothing;
