# Windows IIS + PM2 Quick Deploy Script

## 1️⃣ BACKEND SETUP (Run in PowerShell as Admin)

```powershell
# Navigate to backend
cd C:\apps\ting-ai-backend

# Install dependencies
npm install --production

# Copy env template
copy server\.env.example server\.env

# Edit .env with production values (use Notepad++ or VS Code)
notepad server\.env

# Verify build
npm run build

# Start with PM2
pm2 start ecosystem.config.js --name "ting-ai-backend"

# Save PM2 state (auto-start on reboot)
pm2 save
pm2 startup
pm2-windows-startup install

# Check status
pm2 list
pm2 logs ting-ai-backend
```

**Quick Test:**
```powershell
curl http://localhost:3001/api/health
# Expected: 200 OK
```

---

## 2️⃣ FRONTEND SETUP (Run in PowerShell as Admin)

```powershell
# Navigate to project root
cd C:\apps\ting-ai-frontend

# Install dependencies (if not done)
npm install --production

# Build Next.js
npm run build

# Copy to IIS directory
New-Item -ItemType Directory -Force -Path "C:\inetpub\wwwroot\ting-ai"
xcopy .\.next\static "C:\inetpub\wwwroot\ting-ai\_next\static" /E /I /Y
xcopy .\public "C:\inetpub\wwwroot\ting-ai" /E /I /Y
```

---

## 3️⃣ IIS SETUP (GUI Steps)

### Create Application Pool
```
IIS Manager → Application Pools → New Application Pool
Name: TingAIBackendPool
.NET CLR Version: No Managed Code
Managed Pipeline Mode: Integrated
Identity: ApplicationPoolIdentity
Enable 32-bit Apps: No (unchecked)
Start Automatically: Yes (checked)
```

### Create Website (Backend - Reverse Proxy)
```
IIS Manager → Sites → Add Website
Site Name: Ting AI Backend
Application Pool: TingAIBackendPool
Binding Type: http
IP: All Unassigned
Port: 80
Host Name: api.tingai.id
Physical Path: C:\apps\ting-ai-backend (dummy, only for routing)
```

### Create Website (Frontend)
```
IIS Manager → Sites → Add Website
Site Name: Ting AI Frontend
Application Pool: TingAIFrontendPool
Binding Type: http
IP: All Unassigned
Port: 80
Host Name: tingai.id (or *:80)
Physical Path: C:\inetpub\wwwroot\ting-ai
```

### Add URL Rewrite (Backend - Reverse Proxy)
```
IIS Manager → Sites → Ting AI Backend → URL Rewrite → Add Rules
Pattern: .*
Action: Rewrite
Rewrite URL: http://localhost:3001/{R:0}
Append Query String: Yes
Stop Processing: Yes
```

**Or paste this web.config in `C:\apps\ting-ai-backend\`:**
```xml
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
  </system.webServer>
</configuration>
```

### Add web.config (Frontend - SPA Routing)
**Create `C:\inetpub\wwwroot\ting-ai\web.config`:**
```xml
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
    <staticContent>
      <mimeType fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

---

## 4️⃣ VERIFICATION TESTS

```powershell
# Test backend is reachable
curl http://localhost:3001/api/health

# Test IIS reverse proxy
curl http://api.tingai.id/api/health

# Test frontend IIS serving
curl http://localhost/index.html
curl http://tingai.id/

# View running PM2 processes
pm2 list

# View backend logs
pm2 logs ting-ai-backend --lines 50

# Check for errors
pm2 logs ting-ai-backend --err
```

---

## 5️⃣ MANUAL TESTING CHECKLIST (In Browser)

- [ ] Navigate to `http://tingai.id` (homepage loads)
- [ ] Go to `/upgrade` (no 404 on `/api/payments/status`)
- [ ] Go to `/komando-pagi` (user name is capitalized)
- [ ] Check greeting (matches Asia/Jakarta timezone)
- [ ] Check footer (shows "Faturachman Alkahfi")
- [ ] Check landing hero (text alignment looks correct)
- [ ] Open DevTools Console (no errors)

---

## 6️⃣ PM2 COMMANDS (Common Operations)

```powershell
# View all processes
pm2 list

# View real-time resource usage
pm2 monit

# View last 100 lines of logs
pm2 logs ting-ai-backend

# View error logs only
pm2 logs ting-ai-backend --err

# Restart a specific app
pm2 restart ting-ai-backend

# Reload (graceful restart without downtime)
pm2 reload ting-ai-backend

# Stop all apps
pm2 stop all

# Delete an app from PM2
pm2 delete ting-ai-backend

# View process details (memory, CPU, uptime)
pm2 describe ting-ai-backend
```

---

## 7️⃣ ROLLBACK (If Something Goes Wrong)

```powershell
# Stop services
pm2 stop all

# Go to backend directory
cd C:\apps\ting-ai-backend

# Revert to previous commit
git reset --hard HEAD~1

# Or revert to specific commit
git reset --hard 1a2b3c4d

# Reinstall
npm install --production

# Restart PM2
pm2 start ecosystem.config.js

# Verify
pm2 logs ting-ai-backend
curl http://localhost:3001/api/health
```

---

## 📝 IMPORTANT NOTES

1. **Environment Variables**: Don't forget to edit `server\.env` with your production API keys
2. **Timezone**: If greeting still shows wrong time, we'll add explicit Asia/Jakarta timezone in Patch 2
3. **SSL/HTTPS**: After deployment verification, add SSL binding in IIS + redirect HTTP → HTTPS
4. **Auto-restart**: Make sure `pm2 save` and `pm2 startup` ran so PM2 auto-starts on VPS reboot
5. **Logs**: Check `%USERPROFILE%\.pm2\logs\` for PM2 logs and `C:\inetpub\logs\` for IIS logs

---

## ⚠️ COMMON ISSUES & FIXES

| Issue | Fix |
|-------|-----|
| PM2 process crashes immediately | Check logs: `pm2 logs ting-ai-backend --err` |
| IIS returns 500 error | Check URL Rewrite rule, verify backend is running on port 3001 |
| Frontend SPA routing doesn't work | Verify `web.config` is in `C:\inetpub\wwwroot\ting-ai` |
| "api.tingai.id" doesn't resolve | Check DNS records point to VPS IP, or use `hosts` file for testing |
| Mixed content warning (HTTP/HTTPS) | Install SSL cert and force HTTPS redirect |
| Greeting shows wrong timezone | Check VPS timezone: `Get-Date` - if wrong, add explicit Asia/Jakarta in code |

