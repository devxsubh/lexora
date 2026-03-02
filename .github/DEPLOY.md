# CI/CD and EC2 deployment (Docker + ECR)

## CI (`.github/workflows/ci.yml`)

- **When**: Push to `develop`, pull requests to `main` / `develop`.
- **MongoDB**: `supercharge/mongodb-github-action@1.12.1` (MongoDB 7.0).
- **Secrets**: None. JWT and test DB/user are generated per run (no production secrets in GitHub).
- **Steps**: Generate CI secrets → Lint → Test → Build → Smoke → Build Docker image (verify Dockerfile).

## CD (`.github/workflows/deploy.yml`)

- **When**: Push to `main`.
- **Steps**: Same CI (MongoDB + generated secrets) → Build Docker image → Push to ECR → SSH to EC2 → run `scripts/deploy-ec2.sh` (pull image, run container, **3s health check**, **auto rollback** on failure).

### GitHub secrets (Settings → Secrets and variables → Actions)

| Secret | Required | Description |
|--------|----------|-------------|
| `EC2_SSH_PRIVATE_KEY` | Yes | Full private key body for SSH (contents of `.pem`). |
| `EC2_HOST` | Yes | EC2 hostname or IP. |
| `AWS_ACCESS_KEY_ID` | Yes | For ECR push and (optional) EC2 ECR pull. |
| `AWS_SECRET_ACCESS_KEY` | Yes | For ECR. |
| `AWS_REGION` | Yes | e.g. `ap-south-1`. |
| `ECR_REPOSITORY` | Yes | ECR repository name (e.g. `lexora`). Created automatically if missing. |
| `EC2_USER` | No | SSH user (default: `ec2-user`). |
| `EC2_PORT` | No | SSH port (default: `22`). |
| `APP_DIR` | No | App dir on EC2; `.env` path is `$APP_DIR/.env` (default: `/home/ec2-user/lexora`). |
| `APP_PORT` | No | Host port for the app (default: `8080`). |

### EC2 setup (Docker deploy)

1. **One-time on the instance**
   - **Docker**: Install Docker (e.g. Amazon Linux: `sudo yum install -y docker && sudo systemctl enable docker && sudo systemctl start docker`, then `sudo usermod -aG docker ec2-user`; re-login).
   - **AWS CLI**: For ECR login from EC2 (`aws ecr get-login-password`). Install if not present: `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip -q awscliv2.zip && sudo ./aws/install`.
   - **ECR credentials**: The workflow passes `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` to the deploy script on EC2, so the script uses the same credentials that pushed the image. No IAM instance profile is required on EC2 for ECR. (Optional: you can instead attach an IAM role to the instance with `ecr:GetAuthorizationToken` and `ecr:BatchGetImage`/`ecr:GetDownloadUrlForLayer` and omit passing credentials; then the script uses the instance profile.)
   - Create app directory and **`.env`**: `mkdir -p /home/ec2-user/lexora` and put production env (NODE_ENV, DATABASE_URI, JWT, SMTP, etc.) in `/home/ec2-user/lexora/.env`. Do not commit secrets; they live only on EC2.

2. **SSH**
   - Put the private key in `EC2_SSH_PRIVATE_KEY`. Ensure the security group allows inbound SSH (port 22 or `EC2_PORT`) and inbound **APP_PORT** (e.g. 8080) for the health check and app traffic.

3. **First deploy**
   - Push to `main`. The workflow builds the image, pushes to ECR, SSHs to EC2, runs `deploy-ec2.sh`: ECR login → backup current image → pull new image → run new container with `--env-file` → wait **3s** → health check `GET /api/v1/health` → on success exit 0; on failure **rollback** to previous image and exit 1.

### Health check and rollback

- **Delay**: 3 seconds after starting the container before calling the health endpoint.
- **Endpoint**: `http://127.0.0.1:APP_PORT/api/v1/health`.
- **Rollback**: If the health check fails, the script stops the new container and starts the previous image (tagged as `backup-<timestamp>`). The workflow step fails so the run is marked failed.

### Branches

- **CI** runs on `develop` and on PRs to `main` / `develop` (no deploy).
- **Deploy** runs only on push to `main`.
