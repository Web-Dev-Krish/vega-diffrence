create table if not exists option_ticks (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  symbol text not null,
  strike numeric not null,
  expiry date not null,
  spot_price numeric not null,
  ce_ltp numeric not null,
  pe_ltp numeric not null,
  ce_iv numeric not null,
  pe_iv numeric not null,
  ce_vega numeric not null,
  pe_vega numeric not null,
  vega_diff numeric not null,
  sentiment text not null check (sentiment in ('BULLISH','BEARISH','NEUTRAL')),
  spot_vwap numeric not null,
  signal text check (signal in ('BUY','SELL') or signal is null)
);

create index if not exists idx_option_ticks_symbol_time
  on option_ticks (symbol, created_at desc);

-- Enable Row Level Security
alter table option_ticks enable row level security;

-- Allow anyone with the anon key to READ (adjust for your auth needs)
create policy "Allow public read" on option_ticks
  for select using (true);

-- Only service_role (edge function) can insert
create policy "Allow service insert" on option_ticks
  for insert with check (auth.role() = 'service_role');

-- Enable realtime on this table
alter publication supabase_realtime add table option_ticks;
