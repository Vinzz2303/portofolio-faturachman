# VPS Progress

## Current Goal

Run the React frontend, Node backend, and MySQL database fully from the Windows VPS without Netlify.

## Completed

- React app migrated to TypeScript.
- Server code migrated to TypeScript.
- Frontend build works with `npm run build`.
- Server build works with `npm run build` inside `server`.
- Frontend is served by IIS from `C:\inetpub\wwwroot`.
- React routes work on IIS via `web.config`.
- IIS reverse proxy for `/api` is working.
- Backend runs on port `3001`.
- Public AI endpoint is routed through VPS backend, not Netlify.
- MySQL Server is installed on VPS.
- MySQL service is running as `MySQL96`.
- Backend can connect to local MySQL on `127.0.0.1`.
- Database `fatur_life_os` exists in the local MySQL instance.
- Table `users` exists.
- Auth backend errors now return readable messages.

## Current Paths

- Repo source:
  - `C:\inetpub\wwwroot\portofolio-faturachman`
- Frontend live folder:
  - `C:\inetpub\wwwroot`
- Backend folder:
  - `C:\inetpub\wwwroot\portofolio-faturachman\server`

## Current Environment

Backend `.env` file:

`C:\inetpub\wwwroot\portofolio-faturachman\server\.env`

Expected minimum values:

```env
PORT=3001
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=fatur_life_os
JWT_SECRET=lifeos_fatur_2026_secure_auth_key_981273645
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.1-8b-instant
GROQ_API_KEY=YOUR_GROQ_API_KEY
ALPHAVANTAGE_API_KEY=YOUR_ALPHAVANTAGE_API_KEY
```

## Remaining Issues

### 1. AI still returns "No reply from AI"

Likely causes:

- `GROQ_API_KEY` missing or invalid in `server\.env`
- backend not restarted after env changes
- Groq API request failing

Check with:

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:3001/api/ai-chat" -Method POST -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"halo"}]}' -UseBasicParsing
```

### 2. Dashboard market data fails

Current error:

```text
Table 'fatur_life_os.market_prices' doesn't exist
```

This means the market table is still missing in local MySQL.

Create it with:

```sql
USE fatur_life_os;

CREATE TABLE IF NOT EXISTS market_prices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  symbol VARCHAR(50) NOT NULL,
  timestamp DATETIME NOT NULL,
  price_open DECIMAL(18,8) NULL,
  price_high DECIMAL(18,8) NULL,
  price_low DECIMAL(18,8) NULL,
  price_close DECIMAL(18,8) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

After that, insert real data for:

- `XAUUSD`
- `BTC` or `BTCUSD`
- `SP500`

Without actual rows, charts will still be empty even if the table exists.

### 3. Backend process is still manual

Current backend is started manually with:

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman\server
node .\dist\index.js
```

This should later be changed to a Windows Service or a process manager so it survives session changes more reliably.

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

### Restart backend

```powershell
netstat -ano | findstr :3001
taskkill /PID PID_NUMBER /F
cd C:\inetpub\wwwroot\portofolio-faturachman\server
node .\dist\index.js
```

### Verify DB connection from backend env

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman\server
node -e "require('dotenv').config(); const mysql=require('mysql2/promise'); (async()=>{ const conn=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME}); const [rows]=await conn.query('SELECT DATABASE() AS db'); console.log(rows); await conn.end(); })().catch(console.error)"
```

## Recent Important Commits

- `154e0c6` `fix: surface auth backend errors`
- `cbd75f3` `fix: tighten navbar and add GOLD market chart`
- `65bde36` `fix: route frontend API through IIS proxy`
- `0fad56a` `feat: add account menu and profile page`
- `ec0da00` `fix: route AI chat through VPS backend`
- `60e2b46` `chore: migrate app to TypeScript and prepare Netlify deploy`

## Recommended Next Steps

1. Fill `GROQ_API_KEY` and test `/api/ai-chat`.
2. Create table `market_prices`.
3. Import or populate market data.
4. Re-test dashboard charts.
5. Convert backend process into a Windows Service.
