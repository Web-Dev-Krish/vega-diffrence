# Vega Sentiment Dashboard

## Naye Features (added)

- **Sab values graph mein**: CE Vega, PE Vega, Vega Diff (line chart), Spot vs VWAP + signals
  (composed chart), aur ab **Sentiment Trend** (area chart) bhi — sab real-time update hote hain.
- **Buy/Sell Alerts log**: Right panel mein har BUY/SELL signal ka scrollable history.
- **Bina limitation, real-time**: `useOptionData` hook se hardcoded 200-point cap hata diya gaya
  hai. Settings mein "Max Points" ko `0` set karo = unlimited (bas ek internal 50,000-point safety
  ceiling hai taaki browser tab crash na ho).
- **Settings screen (⚙ button, top-right)**:
  - Dhan, Angel One, **aur Upstox** — teeno ke API keys ek jagah add/edit kar sakte ho.
  - "Use Dhan" / "Use Angel One" / "Use Upstox" button se turant active broker switch ho jata hai — **koi
    redeploy nahi chahiye**, kyunki edge function har poll pe `broker_settings` table se live keys
    padhta hai.
  - Developer Mode toggle — on karne par Dashboard ke neeche raw latest tick JSON aur loaded point
    count dikhta hai.
  - Poll interval aur max points bhi yahi se configure hote hain.

## Real-time + Historical Data (Upstox)

- **Real-time**: existing `fetch-market-data` function pe UPSTOX ko active broker banao — vo har poll pe fresh spot/vega/sentiment/signal insert karta hai (usi jagah candle-close data bhi aa jayega).
- **Historical + preset timeframes**: naya `fetch-historical` edge function Upstox ke history/intraday candle API ko proxy karta hai. Deploy karo:
  ```
  supabase functions deploy fetch-historical
  ```
- Dashboard ke top panel mein ab **5 Min / 15 Min / 1 Hour / 1 Day** buttons hain (candlestick chart, har 30 sec pe auto-refresh).
- **Important limitation**: Upstox v2 sirf `1minute`, `day`, `week`, `month` candles deta hai — koi native 5min/15min/1hour endpoint nahi hai. Isliye 5min/15min/1hour Frontend mein `1minute` candles ko client-side aggregate (bucket) karke banaye jaate hain (`src/lib/candleAggregation.ts`), bilkul waise hi jaise TradingView/Zerodha Kite bhi karte hain jab broker native interval na de.
- Upstox access token **daily expire** hota hai (raat 3:30 AM tak valid) — Settings se roz naya token paste karna hoga jab tak aap OAuth auto-refresh flow add nahi karte.


## Setup in short

1. `supabase/migrations/0001_init.sql`, `0002_broker_settings.sql`, `0003_upstox.sql` teeno run karo
   (Supabase SQL editor ya `supabase db push`).
2. Deploy karo: `supabase functions deploy fetch-market-data` aur `supabase functions deploy fetch-historical`
   (secrets sirf `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` chahiye — broker keys ab DB mein hain).
3. App kholo → Settings → Upstox tab → API Key, API Secret, Access Token daalo → "Use Upstox" dabao.
4. External cron (cron-job.org / GitHub Actions) se har few seconds pe hit karo:
   `https://<project>.functions.supabase.co/fetch-market-data?symbol=NIFTY`

Angel One ka option-chain endpoint Dhan jaisa direct nahi hai — abhi placeholder IV se Vega nikalta
hai. Poore automation ke liye Angel One ka scrip-master JSON download karke nearest-strike CE/PE
tokens map karne wala step add karna hoga (`fetch-market-data/index.ts` mein comment ke saath
jagah chhodi hai).
 (React + Vite + TS + Supabase + Dhan API)

Real-time CE/PE Vega, Vega Difference, Sentiment, Spot VWAP, Buy/Sell signals — charted.

## Architecture

```
Dhan Option Chain API  --(polled every few sec)-->  Supabase Edge Function
                                                            |
                                                            v
                                                   option_ticks table (Postgres)
                                                            |
                                              (Supabase Realtime, INSERT events)
                                                            v
                                              React frontend (Vite) on Vercel
```

Dhan API key kabhi bhi browser me expose nahi hota — sirf Supabase Edge Function
(server-side) usse call karta hai. Frontend sirf Supabase se (anon key, read-only)
data padhta hai.

## 1. Dhan API setup

1. https://dhanhq.co par account banao, DhanHQ API access enable karo.
2. `client-id` aur daily `access-token` generate karo (token 24hr valid hota hai —
   ise roz refresh karna padega; production me DhanLogin flow automate kar sakte ho).
3. Confirm karo: Option Chain API tumhare plan me included hai.

Dhan Option Chain response me already `greeks.vega`, `greeks.delta`, `implied_volatility`
sab milta hai — humein khud Black-Scholes calculate nahi karna padta.

## 2. Supabase setup

```bash
npm install -g supabase
supabase login
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db push        # runs supabase/migrations/0001_init.sql
```

Set secrets for the edge function:

```bash
supabase secrets set DHAN_ACCESS_TOKEN=xxxx
supabase secrets set DHAN_CLIENT_ID=xxxx
```

Deploy the function:

```bash
supabase functions deploy fetch-dhan-data
```

Test it manually:

```bash
curl "https://YOUR_PROJECT.supabase.co/functions/v1/fetch-dhan-data?symbol=NIFTY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Scheduling (important)

Supabase Edge Functions don't have a built-in cron trigger. Dhan's Option Chain
rate limit is **1 request per 3 seconds per unique underlying/expiry**, so poll
at most every 3-5 seconds. Use one of:

- **cron-job.org** (free) — hit the function URL every few seconds (their min
  interval is ~1 min on free tier; for sub-minute polling use a small always-on
  poller instead)
- **A tiny always-on poller**: a free Railway/Render worker (Node script) that
  loops every 3-5 sec and calls the edge function URL — most reliable for
  true real-time
- **pg_cron + pg_net** inside Supabase (can go down to 1 min intervals)

For genuinely "live" (sub-minute) data, the always-on poller is the practical
choice — Pine/TradingView-style true tick-by-tick isn't realistic on a serverless
schedule.

## 3. Frontend setup

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (Project Settings > API)

npm install
npm run dev       # http://localhost:5173
```

## 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

In Vercel dashboard → Project → Settings → Environment Variables, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Redeploy after adding env vars.

## What's included

- `src/components/Dashboard.tsx` — main screen (stat cards + 2 charts)
- `src/components/VegaChart.tsx` — CE Vega / PE Vega / Vega Diff line chart
- `src/components/VwapChart.tsx` — Spot vs VWAP + Buy/Sell markers
- `src/hooks/useOptionData.ts` — loads history + subscribes to Supabase Realtime
- `src/lib/blackScholes.ts` — Black-Scholes Vega formula (fallback/reference;
  Dhan already returns vega directly so this isn't required in the main flow)
- `supabase/functions/fetch-dhan-data/` — server-side poller that calls Dhan,
  computes VWAP + sentiment + signal, writes to Postgres
- `supabase/migrations/0001_init.sql` — table schema + RLS + realtime

## Known limitations / things to improve

- VWAP currently uses a simple tick-weighted average of spot LTP (Dhan's
  option-chain endpoint doesn't return underlying volume). For a textbook
  volume-weighted VWAP, pull underlying volume from Dhan's Market Quote API
  and use that as the weight instead.
- `vwapState` in the edge function resets on cold start — for a reliable
  session VWAP across restarts, persist cumulative sum/volume in a small
  Postgres table keyed by symbol + date instead of an in-memory object.
- Buy/Sell logic here is a simple example (sentiment + VWAP cross). Replace
  `signal` logic in `fetch-dhan-data/index.ts` with your own strategy.
- Access token expires every 24h — automate refresh via Dhan's login flow if
  running unattended.
