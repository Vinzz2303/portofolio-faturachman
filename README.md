# Ting AI Portfolio

Portfolio frontend built with React + Vite, backed by an Express API on the VPS.

## Local frontend

```bash
npm install
npm run dev
```

Default local frontend URL:

`http://localhost:5173`

If you want the frontend to call a different backend during development, set:

```env
VITE_API_URL=
```

See:

- `.env.example`
- `.env.local.example`

## VPS deployment

Frontend source:

`C:\inetpub\wwwroot\portofolio-faturachman`

Frontend live folder:

`C:\inetpub\wwwroot`

Backend live folder:

`C:\inetpub\wwwroot\portofolio-faturachman\server`

Typical deploy flow:

```powershell
cd C:\inetpub\wwwroot\portofolio-faturachman
git pull origin main
npm install
npm run build
Copy-Item .\dist\* C:\inetpub\wwwroot\ -Recurse -Force

cd C:\inetpub\wwwroot\portofolio-faturachman\server
npm install
npm run build
pm2 restart lifeos-backend --update-env
pm2 save
```

## Production notes

- Public site now runs on `https://faturachman.my.id`
- IIS should bind the site to `faturachman.my.id` and `www.faturachman.my.id` only
- `public/web.config` now enforces `https://faturachman.my.id` as the canonical host
- IIS handles React routes and reverse-proxies `/api` to `127.0.0.1:3002`
- HTTPS is enforced through IIS redirect rules and Let's Encrypt certificates

Detailed VPS history and verification notes:

- `VPS_PROGRESS.md`
