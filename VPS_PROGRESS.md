# VPS Progress

## Current Goal

Run the portfolio frontend, backend, and database fully from the Windows VPS so the app stays online even when the laptop is off.

## Confirmed Done

- Frontend already builds successfully with `npm run build`.
- Backend already builds successfully with `npm run build` inside `server`.
- Frontend is served by IIS from `C:\inetpub\wwwroot`.
- React routes are handled through IIS rewrite rules.
- IIS reverse proxy for `/api` is already in place.
- Public AI chat is routed through the VPS backend, not Netlify.
- Backend uses environment variables through `dotenv`.
- MySQL is installed on the VPS and the local database is used by the backend.
- Auth endpoints, profile flow, and AI endpoints already exist in the backend.
- PM2 is running the backend process as `lifeos-backend`.
- Backend AI endpoint `/api/ai-chat` responds correctly on the VPS.
- Groq integration is working in production and returns `usedGroq: true`.
- Investment summary endpoint works with authenticated requests.
- `market_prices` table now exists in the VPS MySQL database.
- Initial VPS market data for `ANTAM` and `SP500` has been inserted.
- Frontend branding has been partially updated toward `Ting AI`.

## Important Reality Check

These are the conditions required so the app keeps running when the laptop is off:

- The backend must run on the VPS, not in a local terminal on the laptop.
- The backend process must be supervised by PM2.
- PM2 startup must be registered so it comes back after a VPS reboot.
- IIS must keep serving the built frontend from the VPS filesystem.

If all four are true, the app no longer depends on the laptop being on.

## Current Paths

- Repo source:
  - `C:\inetpub\wwwroot\portofolio-faturachman`
- Frontend live folder:
  - `C:\inetpub\wwwroot`
- Backend folder:
  - `C:\inetpub\wwwroot\portofolio-faturachman\server`

## Backend Runtime

Backend entrypoint:

`server\dist\index.js`

Useful backend scripts:

```json
{
  "build": "tsc -p tsconfig.json",
  "dev": "tsx src/index.ts",
  "start": "node dist/index.js"
}
```

## Environment Checklist

Backend env file location:

`C:\inetpub\wwwroot\portofolio-faturachman\server\.env`

Minimum required values:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=fatur_life_os
JWT_SECRET=YOUR_JWT_SECRET
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.1-8b-instant
GROQ_API_KEY=YOUR_GROQ_API_KEY
ALPHAVANTAGE_API_KEY=YOUR_ALPHAVANTAGE_API_KEY
```

Optional but recommended:

```env
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=Ting AI <no-reply@tingai.local>
MARKET_CACHE_TTL_MS=3600000
```

## Risks / Gaps To Verify Tonight

### 1. PM2 persistence after reboot still needs explicit confirmation

Current state:

- backend is already running under PM2 as `lifeos-backend`
- manual restart through `pm2 restart lifeos-backend --update-env` works

Still to verify:

- `pm2 save` has been run after the final stable state
- PM2 startup is registered correctly for Windows VPS boot
- backend returns automatically after VPS reboot

### 2. Frontend branding and UX are not fully cleaned up yet

Current state:

- several visible labels have been changed from `LifeOS` to `Ting AI`
- some source files on the VPS were edited manually and rebuilt

Still to verify:

- no public-facing label still shows `LifeOS`
- dashboard and `/lifeos` pages are visually consistent after hard refresh
- local repo and VPS repo are aligned so future deploys do not overwrite fixes

### 3. Public frontend should stop exposing Local Ollama mode

Current state:

- Groq works in production through the VPS backend
- browser console still shows attempts to call `http://localhost:11434/api/generate`

Why this matters:

- `localhost:11434` is invalid for public users
- it creates noisy CORS errors in browser console
- it encourages a production path that depends on local infrastructure

Target state:

- frontend public AI uses Groq only
- `Local (Ollama)` option is removed or hidden from production UI

### 4. HTTPS is still missing

Current state:

- login and auth pages are still served over `http://`
- browser warns that password fields are on an insecure page

Why this matters:

- user credentials are exposed to interception risk
- production auth should not be considered complete without TLS

Target state:

- domain or VPS host serves the site over `https://`
- IIS redirects `http` to `https`

### 5. Secrets hygiene should be reviewed

- Keep production secrets only on the VPS `.env`.
- Do not rely on secrets stored in random local copies.
- If any real API key was accidentally exposed in a local file or screenshot, rotate it.

## Tonight Plan

### Priority 1: Finish production-safe frontend AI behavior

1. Verify PM2 is installed on the VPS.
2. Remove or disable `Local (Ollama)` mode from the public frontend.
3. Rebuild frontend.
4. Copy frontend `dist` output into `C:\inetpub\wwwroot`.
5. Hard-refresh and confirm the browser no longer calls `localhost:11434`.

### Priority 2: Secure the site with HTTPS

1. Bind TLS certificate in IIS.
2. Serve the portfolio over `https://`.
3. Redirect `http` requests to `https`.
4. Re-test login and signup over TLS.

### Priority 3: Lock in PM2 persistence

1. Run `pm2 save`.
2. Register PM2 startup for Windows VPS boot.
3. Reboot-safe check: confirm backend returns after VPS restart.

### Priority 4: Clean deployment workflow

1. Pull latest repo on VPS.
2. Build frontend.
3. Copy frontend `dist` output into `C:\inetpub\wwwroot`.
4. Build backend.
5. Restart PM2 process cleanly.
6. Stop editing production manually unless it is an emergency.
7. Make local repo the source of truth again.

## Useful Commands

### Pull latest repo

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman
git pull origin main
```

### Build frontend

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman
npm install
npm run build
Copy-Item .\dist\* C:\inetpub\wwwroot\ -Recurse -Force
```

### Build backend

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman\server
npm install
npm run build
```

### Start backend with PM2

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman\server
pm2 start .\dist\index.js --name portfolio-backend
pm2 save
```

### PM2 checks

```powershell
pm2 list
pm2 logs portfolio-backend
pm2 restart portfolio-backend
pm2 status
```

### Verify backend health

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/" -UseBasicParsing
```

### Verify DB connection from backend env

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman\server
node -e "require('dotenv').config(); const mysql=require('mysql2/promise'); (async()=>{ const conn=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME}); const [rows]=await conn.query('SELECT DATABASE() AS db'); console.log(rows); await conn.end(); })().catch(console.error)"
```

### Check market table shape

```sql
DESCRIBE market_prices;
SELECT instrument_name, COUNT(*) AS total_rows
FROM market_prices
GROUP BY instrument_name;
```

## Recent Relevant Commits

- `9e87771` `feat: perbaikan AI chat dan persiapan deployment VPS`
- `154e0c6` `fix: surface auth backend errors`
- `cbd75f3` `fix: tighten navbar and add GOLD market chart`
- `65bde36` `fix: route frontend API through IIS proxy`
- `ec0da00` `fix: route AI chat through VPS backend`

## Definition Of Done For Tonight

Tonight is successful if all of these are true:

- frontend live on IIS shows the latest `Ting AI` changes
- backend runs under PM2
- backend comes back automatically after crash/restart
- `/api/ai-chat` returns a valid reply
- `/api/investment-summary` works without schema errors
- dashboard has usable market data for at least `ANTAM` and `SP500`
- public frontend no longer exposes `Local (Ollama)` mode
- login is served over `https://`

## Future Tasks

### Implement Interactive `LifeOS` Dashboard
Redesign the `LifeOS` page to have a clear "Dashboard vs. Assistant" layout, improving UX and interactivity.

- **Phase 1 (Metric Widget):** Replace the current "AI Investment Summary" text block with a "Portfolio Metrics Widget". This widget will display key, glanceable data points like Total Value, Daily Change, and Asset Allocation as structured data (not paragraphs).
- **Phase 2 (AI Assistant):** Implement the `AiChat` component in the right-hand column, acting as an interactive "Financial Assistant". This component should initialize with a welcome prompt, ready to answer questions about the data shown in the widget.
- **Phase 3 (Widget Expansion):** Add a "click-to-expand" feature to the Phase 1 widget. When clicked, it will show a detailed view with a historical performance chart and a full breakdown of all assets.
