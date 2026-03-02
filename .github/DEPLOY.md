# CI/CD and EC2 deployment

## CI (`.github/workflows/ci.yml`)

- **When**: Every push and pull request to `main` and `develop`.
- **Steps**: Install deps → Lint → Test → Build → Smoke.
- No secrets required.

## CD (`.github/workflows/deploy.yml`)

- **When**: Every push to `main` (after CI passes on your side).
- **Steps**: Same as CI, then rsync `dist/`, `package.json`, `package-lock.json`, `ecosystem.config.js` (and `public/` if present) to EC2, run `npm ci --omit=dev` and `pm2 reload` on the server.

### GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Required | Description |
|--------|----------|-------------|
| `EC2_SSH_PRIVATE_KEY` | Yes | Full private key body for SSH (e.g. contents of `.pem`). |
| `EC2_HOST` | Yes | EC2 hostname or IP. |
| `EC2_USER` | No | SSH user (default: `ec2-user`). |
| `EC2_PORT` | No | SSH port (default: `22`). |
| `APP_DIR` | No | Directory on EC2 (default: `~/lexora`). |

### EC2 setup

1. **One-time on the instance**
   - Node.js 20 (e.g. `nvm install 20` or Amazon Linux 2/2023 Node repo). If you use **nvm**, the deploy workflow sources `~/.nvm/nvm.sh` over SSH so `npm`/`npx` are found; ensure nvm is installed in the deploy user’s home (e.g. `~/.nvm`).
   - PM2: `npm install -g pm2` (after Node is in PATH).
   - Create app directory: `mkdir -p ~/lexora` (or your `APP_DIR`).
   - Create `logs` dir if you use file logging: `mkdir -p ~/lexora/logs`.
   - Add a `.env` (or set env in `ecosystem.config.js`) with production config; do not commit secrets.

2. **SSH access for GitHub**
   - Use the key pair you use to connect to EC2 (or a dedicated deploy key).
   - Put the **private** key into the `EC2_SSH_PRIVATE_KEY` secret (full contents, including `-----BEGIN ... -----` and `-----END ... -----`).
   - Ensure the EC2 security group allows inbound SSH (port 22, or your `EC2_PORT`) from the internet or from GitHub’s IPs if you restrict.

3. **First deploy**
   - Push to `main`; the workflow will create/update files in `APP_DIR` and run `pm2 reload` (or `pm2 start` if the app isn’t running yet).

### Branches

- CI runs on `main` and `develop`.
- Deploy runs only on `main`. To deploy from another branch, add it under `on.push.branches` in `deploy.yml` or trigger the workflow manually.
