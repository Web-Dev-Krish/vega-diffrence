-- Adds Upstox as a third supported broker alongside Dhan and Angel One.

alter table broker_settings drop constraint if exists broker_settings_broker_check;
alter table broker_settings add constraint broker_settings_broker_check
  check (broker in ('DHAN', 'ANGELONE', 'UPSTOX'));

alter table broker_settings add column if not exists upstox_api_key text;
alter table broker_settings add column if not exists upstox_api_secret text;
alter table broker_settings add column if not exists upstox_access_token text;
alter table broker_settings add column if not exists upstox_redirect_uri text;

insert into broker_settings (broker, is_active)
values ('UPSTOX', false)
on conflict (broker) do nothing;
