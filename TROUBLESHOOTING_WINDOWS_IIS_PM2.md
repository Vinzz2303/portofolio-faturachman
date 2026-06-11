# Windows IIS + PM2 - Troubleshooting Guide

> **Status**: For Ting AI v1.9 Live Deployment  
> **Date**: May 4, 2026

---

## 🔴 CRITICAL ISSUES

### Issue: Backend PM2 Process Won't Start

**Symptoms:**
- `pm2 list` shows `errored` or `stopped` status
- Logs: `Error: Cannot find module 'express'`

**Diagnosis:**
```powershell
# Check PM2 error logs
pm2 logs ting-ai-backend --err --lines 50

# Try running Node.js manually
cd C:\apps\ting-ai-backend
node server/index.js
# Should start without errors

# Check Node version
node --version  # Should be 18+
npm --version   # Should be 8+
```

**Solutions:**
1. **Missing Dependencies:**
   ```powershell
   cd C:\apps\ting-ai-backend
   npm install --production
   pm2 restart ting-ai-backend
   ```

2. **Wrong Entry Point:**
   - Edit `ecosystem.config.js`: Check `script: "server/index.js"`
   - Verify file exists: `ls server/index.js`
   - Restart: `pm2 restart ting-ai-backend`

3. **Node Modules Corrupt:**
   ```powershell
   cd C:\apps\ting-ai-backend
   rmdir node_modules /s /q
   npm install --production
   pm2 restart ting-ai-backend
   ```

4. **Port Already in Use (3001 busy):**
   ```powershell
   # Find process using port 3001
   netstat -ano | findstr :3001
   # Kill process by PID
   taskkill /PID <PID> /F
   
   # Or change port in ecosystem.config.js to 3002
   pm2 restart ting-ai-backend
   ```

---

### Issue: IIS Returns 500 Error (Reverse Proxy Not Working)

**Symptoms:**
- Browser shows "500 Internal Server Error"
- `/api/health` fails through IIS but works on localhost

**Diagnosis:**
```powershell
# Test backend directly
curl http://localhost:3001/api/health
# Should return 200

# Test IIS reverse proxy
curl http://api.tingai.id/api/health
# If fails, IIS routing broken
```

**Solutions:**
1. **URL Rewrite Rule Missing:**
   - IIS Manager → Sites → "Ting AI Backend" → URL Rewrite → Add Rule
   - Pattern: `.*`
   - Rewrite URL: `http://localhost:3001/{R:0}`
   - Test URL: `http://api.tingai.id/api/health`

2. **Backend Not Running:**
   ```powershell
   pm2 list  # Check if process status is "online"
   pm2 logs ting-ai-backend  # Check for errors
   pm2 start ecosystem.config.js --name "ting-ai-backend"
   ```

3. **Wrong Binding in IIS:**
   - IIS Manager → Sites → "Ting AI Backend" → Bindings
   - Verify binding is `http://api.tingai.id` (if DNS ready) or `http://*:80`
   - Test with IP: `curl http://<your-vps-ip>:80/api/health`

4. **IIS Application Request Routing (ARR) Not Installed:**
   ```powershell
   # Server Manager → Add Roles/Features
   # Check: Application Server → Web Server (IIS) → Application Request Routing
   # If missing, install and reboot
   ```

5. **IIS URL Rewrite Not Installed:**
   - Server Manager → Add Roles/Features
   - Web Server (IIS) → Web Server → Application Development → URL Rewrite
   - Install and restart IIS: `iisreset`

---

### Issue: Frontend SPA Routes Return 404

**Symptoms:**
- `/komando-pagi` shows 404
- Refreshing page from non-root URL breaks
- `web.config` exists but doesn't work

**Diagnosis:**
```powershell
# Check if web.config exists
ls C:\inetpub\wwwroot\ting-ai\web.config

# Test static files
curl http://tingai.id/index.html  # Should work
curl http://tingai.id/komando-pagi  # Might fail
```

**Solutions:**
1. **web.config Missing or Misconfigured:**
   - Create `C:\inetpub\wwwroot\ting-ai\web.config`
   - Paste this (See QUICK_DEPLOY guide for full config):
   ```xml
   <rule name="SPARule" stopProcessing="true">
     <match url=".*" />
     <conditions logicalGrouping="MatchAll">
       <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
       <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
     </conditions>
     <action type="Rewrite" url="/index.html" />
   </rule>
   ```

2. **URL Rewrite Not Active:**
   - IIS Manager → Sites → "Ting AI Frontend" → URL Rewrite
   - Verify rule exists and is enabled (not grayed out)

3. **Static Files Not Copied:**
   ```powershell
   # Verify files exist
   ls C:\inetpub\wwwroot\ting-ai\_next\static
   ls C:\inetpub\wwwroot\ting-ai\public
   
   # If missing, copy again
   xcopy C:\apps\ting-ai-frontend\.next\static C:\inetpub\wwwroot\ting-ai\_next\static /E /I /Y
   xcopy C:\apps\ting-ai-frontend\public C:\inetpub\wwwroot\ting-ai /E /I /Y
   ```

4. **Application Pool Permissions Issue:**
   - Right-click `C:\inetpub\wwwroot\ting-ai` → Properties → Security
   - Verify `IIS AppPool\TingAIFrontendPool` has "Read & Execute" permissions
   - Add if missing: Click Edit → Add → Type `IIS AppPool\TingAIFrontendPool` → OK

---

## ⚠️ COMMON ISSUES

### Issue: Greeting Shows Wrong Timezone

**Symptoms:**
- User is in Asia/Jakarta (UTC+7)
- Greeting shows time in UTC or different timezone

**Short-term Test:**
```powershell
# Check VPS timezone
Get-Date

# Check if it's UTC or Asia/Jakarta
# If wrong, temporarily set:
# Settings → Time & Language → Date & Time → Time zone: (UTC+07:00) Bangkok, Hanoi, Jakarta
```

**Permanent Fix (Patch 2):**
- Add explicit timezone handling in Node.js backend:
```javascript
const date = new Date();
const jakartaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
// Use jakartaTime for greeting
```

**Or use Luxon (recommended):**
```javascript
const { DateTime } = require('luxon');
const now = DateTime.now().setZone('Asia/Jakarta');
```

---

### Issue: `/upgrade` Returns 404 on `/api/payments/status`

**Symptoms:**
- Page loads but shows error fetching payment status
- Backend logs show 404

**Diagnosis:**
```powershell
# Check if endpoint exists
curl http://localhost:3001/api/payments/status

# Check route handler exists
cd C:\apps\ting-ai-backend
grep -r "payments/status" server/
```

**Solution:**
- Verify route is defined in backend
- Endpoint should return 200 (even if no payments data)
- If endpoint missing, create in Patch 2

---

### Issue: API Calls Return CORS Error

**Symptoms:**
- Browser console: `Cross-Origin Request Blocked`
- Frontend can't reach backend API

**Diagnosis:**
```powershell
# Check CORS headers returned
curl -i http://api.tingai.id/api/health
# Look for: Access-Control-Allow-Origin: *
```

**Solution:**
Edit `server/index.js` and add CORS middleware:
```javascript
const cors = require('cors');

app.use(cors({
  origin: ['https://tingai.id', 'http://tingai.id'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Before any routes
```

Restart backend:
```powershell
pm2 restart ting-ai-backend
```

---

### Issue: PM2 Processes Don't Auto-Start After VPS Reboot

**Symptoms:**
- VPS reboots, PM2 services not running
- Have to manually run `pm2 start` each time

**Solution:**
```powershell
# Save PM2 state
pm2 save

# Create auto-startup service
pm2 startup
# This generates a command, copy and paste it

# For Windows specifically
pm2 install pm2-windows-startup
pm2-windows-startup install

# Verify it worked
pm2-windows-startup list
```

**Verify:**
1. Reboot VPS: `shutdown /r /t 0`
2. After reboot, check: `pm2 list`
3. Processes should show `online` status

---

### Issue: Application Pool Recycles/Crashes

**Symptoms:**
- IIS app pool keeps stopping/restarting
- Website returns 503 Service Unavailable

**Diagnosis:**
```powershell
# Check IIS logs
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\*" -Tail 20

# Check app pool status
Get-WebAppPoolState -Name "TingAIBackendPool"
# Should show "Started"
```

**Solutions:**
1. **Out of Memory:**
   - IIS Manager → Application Pools → TingAIBackendPool → Recycling
   - Check private memory limit (if low, increase)

2. **Timeout:**
   - Connection timeout too short
   - IIS Manager → TingAIBackendPool → Advanced Settings → Idle Time-out: 20 min

3. **Invalid web.config:**
   - Run IIS configuration test:
   ```powershell
   iisreset /restart
   ```

---

## 🔧 ADVANCED DEBUGGING

### Enable Detailed PM2 Logging

```powershell
# Set PM2 debug mode
$env:PM2_SILENT = "false"
pm2 start ecosystem.config.js

# Watch logs in real-time
pm2 logs ting-ai-backend --follow
```

### Monitor Resource Usage in Real-Time

```powershell
# System Monitor
Get-Process node | Select-Object Name, Id, Handles, @{Name="Memory(MB)"; Expression={[math]::round($_.WorkingSet/1MB, 2)}}

# PM2 monitoring
pm2 monit
```

### Test Backend Connectivity

```powershell
# Test from VPS locally
curl http://localhost:3001/api/health

# Test from outside
curl http://<your-vps-ip>/api/health

# Test specific endpoint
curl -X GET http://api.tingai.id/api/v1/portfolio/list -H "Authorization: Bearer <token>"
```

### Database Connection Test

```powershell
# Test MySQL connection
cd C:\apps\ting-ai-backend
# Create test.js:
# const mysql = require('mysql2/promise');
# mysql.createConnection({ host, user, password, database }).then(() => console.log('DB OK')).catch(e => console.error(e));

node test.js
```

---

## 📊 PERFORMANCE OPTIMIZATION

### If Backend Memory Usage Grows

```powershell
# Set max memory restart
# Edit ecosystem.config.js: max_memory_restart: "500M"

pm2 restart ting-ai-backend

# Monitor memory
pm2 describe ting-ai-backend
```

### If CPU Usage High

```powershell
# Check CPU per process
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Format-List Name, Id, CPU

# Reduce PM2 instances if too many
# Edit ecosystem.config.js: instances: 2  (instead of "max")

pm2 restart ting-ai-backend
```

### If Frontend Loading Slow

```powershell
# Check if gzip enabled in IIS
IIS Manager → Compression → Enable static compression

# Check file sizes
ls -lS C:\inetpub\wwwroot\ting-ai\_next\static\

# Cache headers
# Edit web.config: <add name="Cache-Control" value="public, max-age=31536000" />
```

---

## 🆘 EMERGENCY ROLLBACK

If production is broken:

```powershell
# 1. Stop services immediately
pm2 stop all

# 2. Revert to last working version
cd C:\apps\ting-ai-backend
git log --oneline -5
# Note commit hash of last working version

git reset --hard <commit-hash>
# e.g., git reset --hard abc1234

# 3. Clear cache
npm cache clean --force

# 4. Reinstall and rebuild
npm install --production
npm run build

# 5. Restart
pm2 start ecosystem.config.js

# 6. Verify
curl http://localhost:3001/api/health
pm2 logs ting-ai-backend
```

---

## ✅ QUICK HEALTH CHECK (Run Weekly)

```powershell
# 1. Check processes
pm2 list
# All should show "online"

# 2. Check memory
pm2 describe ting-ai-backend | grep memory
# Should be < 500MB

# 3. Check logs for errors
pm2 logs ting-ai-backend --err --lines 20
# Should be minimal

# 4. Test API
curl http://localhost:3001/api/health
# Should return 200

# 5. Test frontend
curl http://localhost/index.html
# Should return 200

# 6. Check IIS app pools
Get-WebAppPoolState -Name "TingAIBackendPool"
Get-WebAppPoolState -Name "TingAIFrontendPool"
# Both should show "Started"

# 7. Test database connection (if available)
# Run manual query to verify DB connectivity
```

---

## 📞 ESCALATION PATH

1. **Issue persists after 15 minutes?**
   - Collect logs: `pm2 logs ting-ai-backend > backend.log`
   - Collect IIS logs: Copy `C:\inetpub\logs\LogFiles\*`
   - Collect system info: `systeminfo > systeminfo.txt`
   - Create GitHub issue with logs

2. **Need expert help?**
   - Contact DevOps team or Vercel support
   - Consider managed hosting (Vercel, Netlify, DigitalOcean) instead of IIS

---

## 📚 USEFUL LINKS

- PM2 Docs: https://pm2.keymetrics.io/docs/usage/quick-start
- IIS URL Rewrite: https://docs.microsoft.com/en-us/iis/extensions/url-rewrite-module/using-the-url-rewrite-module
- Windows PowerShell: https://docs.microsoft.com/en-us/powershell/
- Node.js on Windows: https://nodejs.org/en/download/

---

**Last Updated:** May 4, 2026  
**Status:** Ready for Production Testing
