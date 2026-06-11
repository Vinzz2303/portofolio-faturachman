# Windows VPS/IIS + PM2 Deployment Checklist - Ting AI v1.9

**Date:** May 4, 2026  
**Target:** Production Deployment with Manual Testing

---

## PRE-DEPLOYMENT CHECKLIST

### ✅ Local Verification (Before Upload)
- [ ] Patch 1 approved and merged to main
- [ ] Run `npm run build` successfully (no TypeScript errors)
- [ ] All `.env` variables configured locally
- [ ] Test `/api/payments/status` endpoint (should not 404 on `/upgrade`)
- [ ] Test `/komando-pagi` user name capitalization
- [ ] Test greeting with local timezone awareness
- [ ] Verify footer shows "Faturachman Alkahfi"
- [ ] Visual check: landing hero text alignment (no overflow)
- [ ] Playwright tests pass: `npm run test:playwright`

### ✅ VPS Access & Prerequisites
- [ ] SSH/RDP access to Windows VPS confirmed
- [ ] Windows Server 2019 / 2022 (check OS version)
- [ ] Administrator account access verified
- [ ] Node.js 18+ LTS installed (`node --version`, `npm --version`)
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] IIS installed and running (Server Manager → Add Roles)
- [ ] IIS URL Rewrite Module installed
- [ ] IIS Application Request Routing (ARR) installed
- [ ] Git installed on VPS

---

## BACKEND DEPLOYMENT (Node.js + PM2)

### Phase 1: Prepare Backend Directory
- [ ] Create backend directory: `C:\apps\ting-ai-backend` (or similar)
- [ ] Set proper NTFS permissions (Full Control for App Pool identity)
- [ ] Clone/copy repository: `git clone <repo-url>` or SCP files

### Phase 2: Install & Configure Backend
- [ ] Navigate to backend folder: `cd C:\apps\ting-ai-backend`
- [ ] Install dependencies: `npm install --production` (skip devDeps)
- [ ] Copy `.env.example` to `.env`: `copy server\.env.example server\.env`
- [ ] **Edit `server\.env` with production values:**
  - [ ] `DB_HOST=<production-db-ip>`
  - [ ] `DB_USER=<prod-user>`
  - [ ] `DB_PASSWORD=<secure-password>`
  - [ ] `DB_NAME=fatur_life_os_prod`
  - [ ] `GEMINI_API_KEY=<your-key>`
  - [ ] `GROQ_API_KEY=<your-key>` (if using Groq fallback)
  - [ ] `TWELVEDATA_API_KEY=<your-key>`
  - [ ] `ALPHAVANTAGE_API_KEY=<your-key>`
  - [ ] `MARKETAUX_API_TOKEN=<your-token>`
  - [ ] `PORT=3001` (backend port, behind IIS reverse proxy)
  - [ ] `NODE_ENV=production`
  - [ ] `EMAIL_HOST=<smtp-server>`
  - [ ] `EMAIL_PORT=2525`
  - [ ] `EMAIL_USER=<email-user>`
  - [ ] `EMAIL_PASS=<email-pass>`
  - [ ] `EMAIL_FROM=noreply@tingai.id`

### Phase 3: Setup PM2
- [ ] **Create PM2 ecosystem file** `C:\apps\ting-ai-backend\ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "ting-ai-backend",
      script: "server/index.js",  // or your entry point
      instances: 2,               // or "max" for all cores
      exec_mode: "cluster",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      error_file: "logs/error.log",
      out_file: "logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M",
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s"
    }
  ],
  deploy: {
    production: {
      user: "app",
      host: "your-vps-ip",
      ref: "origin/main",
      repo: "your-git-repo.git",
      path: "C:/apps/ting-ai-backend",
      "post-deploy": "npm install --production && pm2 reload ecosystem.config.js"
    }
  }
};
```

- [ ] **Start backend with PM2:**
```bash
pm2 start ecosystem.config.js --name "ting-ai-backend"
pm2 save
pm2 startup
```

- [ ] **Verify PM2 process is running:**
```bash
pm2 list
pm2 logs ting-ai-backend
```

- [ ] **Test backend locally on VPS:**
```bash
curl http://localhost:3001/api/health
# Should return 200 OK
```

- [ ] **Create PM2 service for Windows startup:**
```bash
pm2 install pm2-windows-startup
pm2-windows-startup install
pm2 save
```

---

## FRONTEND DEPLOYMENT (Next.js Static Export)

### Phase 1: Build Frontend
- [ ] Navigate to frontend: `cd C:\apps\ting-ai-frontend` (or project root)
- [ ] **Build Next.js for static export:**
```bash
npm run build
# Creates .next/standalone or out/ directory
```

- [ ] Verify build output exists:
  - [ ] Check `.next/static` folder (CSS, JS bundles)
  - [ ] Check `.next/standalone` or `out/` folder (HTML files)

### Phase 2: Deploy Frontend to IIS

#### Option A: Static HTML Export (Recommended for simple setup)
- [ ] Create IIS directory: `C:\inetpub\wwwroot\ting-ai`
- [ ] Copy build output:
```bash
xcopy .next\static "C:\inetpub\wwwroot\ting-ai\_next\static" /E /I
xcopy public "C:\inetpub\wwwroot\ting-ai" /E /I
# Copy all HTML files and assets
```

#### Option B: Run Next.js Server (Advanced)
- [ ] Create directory: `C:\apps\ting-ai-frontend`
- [ ] Install dependencies: `npm install --production`
- [ ] Create PM2 config for Next.js:

```javascript
{
  name: "ting-ai-frontend",
  script: "npm",
  args: "start",
  instances: 1,
  exec_mode: "fork",
  env: {
    NODE_ENV: "production",
    PORT: 3000
  }
}
```

- [ ] Start with PM2:
```bash
pm2 start ecosystem.config.js --name "ting-ai-frontend"
pm2 save
```

---

## IIS CONFIGURATION

### Phase 1: Create IIS Application Pool & Site

#### For Backend (Node.js Reverse Proxy)
- [ ] **Open IIS Manager** → Application Pools
- [ ] **New Application Pool:**
  - [ ] Name: `TingAIBackendPool`
  - [ ] .NET CLR version: `No Managed Code`
  - [ ] Managed pipeline mode: `Integrated`
  - [ ] Identity: `ApplicationPoolIdentity` or service account
  - [ ] Enable 32-bit apps: **No**
  - [ ] Autostart: **Yes**

- [ ] **Create Website:**
  - [ ] Name: `Ting AI Backend`
  - [ ] Application pool: `TingAIBackendPool`
  - [ ] Binding: `http://api.tingai.id` (or `*:443` with SSL)
  - [ ] Physical path: `C:\apps\ting-ai-backend` (can be dummy path)

#### For Frontend (Static/Next.js)
- [ ] **New Application Pool:**
  - [ ] Name: `TingAIFrontendPool`
  - [ ] .NET CLR version: `No Managed Code`
  - [ ] Managed pipeline mode: `Integrated`
  - [ ] Identity: `ApplicationPoolIdentity`
  - [ ] Autostart: **Yes**

- [ ] **Create Website:**
  - [ ] Name: `Ting AI Frontend`
  - [ ] Application pool: `TingAIFrontendPool`
  - [ ] Binding: `http://tingai.id` or `https://tingai.id`
  - [ ] Physical path: `C:\inetpub\wwwroot\ting-ai`

### Phase 2: URL Rewrite (Reverse Proxy Backend)

**On Backend Website (api.tingai.id):**
- [ ] **Install URL Rewrite Module** (if not done)
- [ ] **Open URL Rewrite** → Add Rules
- [ ] **Create Rule: Reverse Proxy to PM2 Node Backend**
  - [ ] Pattern: `.*`
  - [ ] Action type: `Rewrite`
  - [ ] Rewrite URL: `http://localhost:3001/{R:0}`
  - [ ] Append query string: **Yes**
  - [ ] Stop processing: **Yes**

```xml
<!-- web.config for backend -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxy" stopProcessing="true">
          <match url=".*" />
          <action type="Rewrite" url="http://localhost:3001/{R:0}" />
        </rule>
      </rules>
    </rewrite>
    <httpErrors>
      <error statusCode="404" prefixLanguageFilePath="" path="index.html" responseMode="File" />
    </httpErrors>
  </system.webServer>
</configuration>
```

**On Frontend Website (tingai.id):**
- [ ] **Configure for SPA routing:**

```xml
<!-- web.config for frontend -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPARule" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <httpProtocol>
      <customHeaders>
        <add name="Cache-Control" value="public, max-age=31536000" />
      </customHeaders>
    </httpProtocol>
    <staticContent>
      <mimeType fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

### Phase 3: HTTPS/SSL Configuration (Recommended)

- [ ] **Request SSL certificate** (Let's Encrypt via IIS or commercial CA)
- [ ] **Add HTTPS binding:**
  - [ ] Port: 443
  - [ ] Certificate: Select uploaded cert
  - [ ] SNI: **Enabled**

- [ ] **Force HTTP → HTTPS redirect:**

```xml
<rule name="HTTPtoHTTPS" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="off" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Permanent" />
</rule>
```

---

## DATABASE SETUP

- [ ] **Create production database (if using MySQL):**
```sql
CREATE DATABASE fatur_life_os_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ting_ai_prod'@'localhost' IDENTIFIED BY 'strong-password-here';
GRANT ALL PRIVILEGES ON fatur_life_os_prod.* TO 'ting_ai_prod'@'localhost';
FLUSH PRIVILEGES;
```

- [ ] **Run migrations** (if applicable):
```bash
npm run migrate:prod
```

- [ ] **Backup production database** (create backup schedule):
```bash
# Add to Windows Task Scheduler for daily backups
mysqldump -u ting_ai_prod -p fatur_life_os_prod > backup-$(date).sql
```

---

## LIVE TESTING CHECKLIST

### Backend Tests (After PM2 starts)
- [ ] `/api/health` returns 200
- [ ] `/api/v1/portfolio/list` works (auth check)
- [ ] `/api/upgrade` loads without 404 on `/api/payments/status`
- [ ] Email endpoints functional (if configured)
- [ ] API response times < 2000ms

### Frontend Tests (After IIS serves)
- [ ] Homepage loads (`/`)
- [ ] `/komando-pagi` user name is capitalized
- [ ] Greeting matches local timezone (Asia/Jakarta)
- [ ] Footer displays "Faturachman Alkahfi"
- [ ] Landing hero text alignment correct (no overflow)
- [ ] All routes render correctly (SPA routing works)
- [ ] Static assets load (CSS, JS, fonts)
- [ ] Mobile responsive layout works

### API Integration Tests
- [ ] Frontend → Backend API calls work (CORS configured if needed)
- [ ] No mixed content errors (HTTP/HTTPS)
- [ ] Error handling displays correctly

### Performance Tests
- [ ] Page load time < 3s
- [ ] API response time < 2s
- [ ] PM2 memory usage stable
- [ ] No console errors in browser DevTools

---

## POST-DEPLOYMENT MAINTENANCE

### PM2 Management
```bash
# View running processes
pm2 list

# View logs
pm2 logs ting-ai-backend
pm2 logs ting-ai-frontend

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Reload (graceful restart)
pm2 reload ting-ai-backend
pm2 reload ting-ai-frontend

# Monit dashboard
pm2 monit
```

### Monitoring & Alerts
- [ ] Setup PM2 Plus (optional cloud monitoring)
- [ ] Configure Windows Task Scheduler for auto-backups
- [ ] Create log rotation policy (PM2 logs can grow large)
- [ ] Monitor disk space on VPS
- [ ] Monitor IIS Application Pool crashes

### Logs Location
- [ ] Backend: `C:\apps\ting-ai-backend\logs\`
- [ ] Frontend: `C:\apps\ting-ai-frontend\logs\` (if running with PM2)
- [ ] IIS: `C:\inetpub\logs\LogFiles\`
- [ ] PM2: `%USERPROFILE%\.pm2\logs\`

### Deployment Updates (Future Patches)
```bash
# On VPS, pull latest changes
cd C:\apps\ting-ai-backend
git pull origin main

# Rebuild and deploy
npm install --production
npm run build

# Reload PM2 processes
pm2 reload ecosystem.config.js

# For frontend (if using Next.js PM2 method)
cd C:\apps\ting-ai-frontend
git pull origin main
npm install --production
npm run build
pm2 reload ting-ai-frontend
```

---

## TROUBLESHOOTING

### Backend not starting (PM2)
```bash
# Check PM2 error logs
pm2 logs ting-ai-backend --err

# Verify Node version matches dev environment
node --version

# Test manually
cd C:\apps\ting-ai-backend
npm install
node server/index.js
```

### IIS 404 errors on API calls
- [ ] Verify URL Rewrite rule is active
- [ ] Check backend PM2 process is running
- [ ] Test `curl http://localhost:3001/api/health` on VPS
- [ ] Review IIS logs: `C:\inetpub\logs\LogFiles\`

### Frontend SPA routing issues
- [ ] Verify `web.config` rewrite rule is applied
- [ ] Check that `.html` files are not being cached incorrectly
- [ ] Test with `curl http://localhost/some-route` on VPS

### Timezone greeting not working
- [ ] Check server timezone setting: `date /t`
- [ ] Review Asia/Jakarta offset in code
- [ ] Check browser local time in DevTools Console: `new Date()`
- [ ] If still wrong: Create explicit timezone patch using `luxon` or `date-fns`

### CORS errors from frontend to backend API
- [ ] Add CORS headers in backend `server/index.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://tingai.id', 'https://www.tingai.id'],
  credentials: true
}));
```

- [ ] Restart PM2: `pm2 restart ting-ai-backend`

---

## ROLLBACK PROCEDURE

If Patch 1 causes issues in production:

```bash
# 1. Stop current services
pm2 stop all

# 2. Revert to last working commit
cd C:\apps\ting-ai-backend
git revert HEAD --no-edit
# or
git reset --hard <commit-hash-before-patch>

# 3. Reinstall and rebuild
npm install --production
npm run build

# 4. Restart
pm2 start ecosystem.config.js

# 5. Verify health
curl http://localhost:3001/api/health
```

---

## FINAL SIGN-OFF

- [ ] All checklist items completed
- [ ] Manual testing passed (all 5 test cases)
- [ ] PM2 processes stable for 5+ minutes
- [ ] IIS sites responding correctly
- [ ] Logs show no errors
- [ ] Ready for: Patch 2 only after successful live deployment

**Deployed By:** [Your Name]  
**Date:** [Deployment Date]  
**Status:** ✅ Production Ready / ❌ Issues Found (describe)

