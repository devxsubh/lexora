#!/usr/bin/env bash
# Run on EC2 via SSH from GitHub Actions. Uses env: ECR_IMAGE, APP_PORT, ENV_FILE, CONTAINER_NAME.
# Logs into ECR (expects AWS credentials or instance profile), pulls image, runs with health check and rollback.
set -e

ECR_IMAGE="${ECR_IMAGE:?ECR_IMAGE required}"
APP_PORT="${APP_PORT:-8080}"
ENV_FILE="${ENV_FILE:-/home/ec2-user/lexora/.env}"
CONTAINER_NAME="${CONTAINER_NAME:-lexora-app}"
HEALTH_URL="http://127.0.0.1:${APP_PORT}/api/v1/health"
HEALTH_DELAY_SEC="${HEALTH_DELAY_SEC:-3}"

echo "==> Logging into ECR..."
aws ecr get-login-password --region "${AWS_REGION:-${AWS_DEFAULT_REGION}}" | docker login --username AWS --password-stdin "${ECR_IMAGE%%/*}"

echo "==> Backing up current running image (for rollback)..."
BACKUP_TAG="backup-$(date +%s)"
CID=$(docker ps -q -f "name=${CONTAINER_NAME}" | head -1)
CURRENT_IMAGE_ID=""
[ -n "${CID}" ] && CURRENT_IMAGE_ID=$(docker inspect -f '{{.Image}}' "${CID}" 2>/dev/null || true)
if [ -n "${CURRENT_IMAGE_ID}" ]; then
  docker tag "${CURRENT_IMAGE_ID}" "${ECR_IMAGE%:*}:${BACKUP_TAG}"
fi

echo "==> Pulling new image..."
docker pull "${ECR_IMAGE}"

echo "==> Stopping and removing existing container..."
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

echo "==> Starting new container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${APP_PORT}:8080" \
  --restart unless-stopped \
  --env-file "${ENV_FILE}" \
  "${ECR_IMAGE}"

echo "==> Waiting ${HEALTH_DELAY_SEC}s before health check..."
sleep "${HEALTH_DELAY_SEC}"

echo "==> Health check..."
if curl -sf --max-time 10 "${HEALTH_URL}" > /dev/null; then
  echo "==> Health check passed."
  # Remove old backup images (keep last 2)
  docker images --format '{{.Repository}}:{{.Tag}}' | grep ":backup-" | tail -n +3 | xargs -r docker rmi 2>/dev/null || true
  exit 0
fi

echo "==> Health check FAILED. Rolling back..."
docker stop "${CONTAINER_NAME}" 2>/dev/null || true
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

ROLLBACK_IMAGE="${ECR_IMAGE%:*}:${BACKUP_TAG}"
if docker image inspect "${ROLLBACK_IMAGE}" >/dev/null 2>&1; then
  docker run -d \
    --name "${CONTAINER_NAME}" \
    -p "${APP_PORT}:8080" \
    --restart unless-stopped \
    --env-file "${ENV_FILE}" \
    "${ROLLBACK_IMAGE}"
  echo "==> Rolled back to ${ROLLBACK_IMAGE}"
else
  echo "==> No backup image found; container stopped."
fi
exit 1
