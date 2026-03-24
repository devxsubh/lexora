# Next Steps and Fixes

A prioritized list of fixes and steps before and after your first production deploy.

---

## 1. Code/config fixes (do first) ✅ Done

### 1.1 Ensure `logs/` exists before file logging ✅
**Issue:** Winston writes to `logs/error.log` and `logs/combined.log`. If `logs/` doesn’t exist (e.g. first run, new clone), the app can crash.

**Fix applied:** `src/config/logger.ts` now runs `fs.mkdirSync('logs', { recursive: true })` before creating the File transports.

### 1.2 Align default PORT with `.env.example` ✅
**Issue:** `src/config/config.ts` used to default `PORT` to `666` and `FRONTEND_URL`/`IMAGE_URL` to `localhost:777`/`localhost:666`. `.env.example` uses `8080` and `3000`/`8080`.

**Fix applied:** Config defaults are now `PORT` 8080, `FRONTEND_URL` http://localhost:3000, `IMAGE_URL` http://localhost:8080/images.

### 1.3 Remove empty `api/` folder ✅
**Issue:** The `api/` directory was empty after removing the Vercel serverless entry point.

**Fix applied:** The `api/` folder has been removed.

---

## 2. Before first production deploy

### 2.1 Host setup
On your server (VPS, PaaS shell, etc.):

1. Install Node 20 and PM2:  
   `nvm install 20` (or distro Node) and `npm install -g pm2`.
2. Create app directory and clone or upload the built app.
3. Create logs directory:  
   `mkdir -p ~/lexora/logs` (or your app path).
4. Add production env:  
   Copy from `.env.example`, set `NODE_ENV=production`, real `DATABASE_URI`, JWT keys, CORS, etc.  
   Do **not** commit `.env`; keep it only on the server (or in a secrets manager).

### 2.2 Firewall
Allow inbound SSH from trusted IPs and HTTP/HTTPS (or app port) as needed for your setup.

---

## 3. After first deploy (recommended)

### 3.1 Reverse proxy (nginx)
Run the app on a high port (e.g. 8080) and put nginx in front for TLS:

- Terminate SSL at nginx.
- Proxy `/` (or `/api`) to `http://127.0.0.1:8080`.
- Optionally serve `public/` or static files from nginx.

### 3.2 Production CORS
Set `CORS_ORIGIN` to your real frontend origin(s), not `*`, e.g.:

`CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com`

### 3.3 Health check
You already have `GET /api/v1/health`. Use it for:

- PM2 / process managers.
- Load balancer health checks.
- Uptime checks.

### 3.4 Guard seeding in production (optional)
To avoid accidentally seeding in production with default passwords:

- In seed logic (or `initialData`), if `NODE_ENV === 'production'` and `SEED_DATABASE === true`, require a strong `SEED_DEFAULT_PASSWORD` or an explicit “allow seed in production” flag before running.

---

## 4. Optional improvements

| Item | Description |
|------|-------------|
| **ecosystem.config.js** | Add `cwd` to a fixed path so PM2 always runs from the app directory. |
| **PM2 instances** | `instances: 'max'` uses all CPUs. For a single small instance, `instances: 1` can be simpler; tune as needed. |
| **MongoDB** | Use a managed service (e.g. Atlas) in production and set `DATABASE_URI` on the server. |
| **Domain & TLS** | Point a domain at your host and configure nginx (e.g. Let’s Encrypt) for HTTPS. |

---

## 5. Quick reference

- **CI:** Lint, test, build, smoke on push/PR to `main` and `develop` (`.github/workflows/ci.yml`).
- **Health:** `GET /api/v1/health` – 200 when DB is connected, 503 otherwise.

Start with **§1** (code fixes), then **§2** (host setup), then deploy. After that, add **§3** (nginx, CORS, health usage, optional seed guard) and **§4** as you go.
