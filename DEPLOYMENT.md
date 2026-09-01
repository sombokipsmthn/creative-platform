# Deployment Guide

## GitHub Actions Workflows

### CI (`ci.yml`)
Runs on every push/PR to `main` or `develop`:
- Lints code with ESLint
- Runs tests with Vitest
- Builds Next.js application

### Docker Build & Push (`docker.yml`)
Triggers on semver tags (e.g., `v1.0.0`) or manual dispatch:
- Builds multi-stage Docker image
- Pushes to GitHub Container Registry (GHCR)
- **Automatically triggers Vercel deployment** via webhook
- Creates a GitHub Release with image metadata

## Setup Instructions

### 1. GitHub Secrets
Add these to your repository Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN          # From https://vercel.com/account/tokens
```

No additional secrets needed — `GITHUB_TOKEN` is auto-injected.

### 2. Staging with Docker Compose

**Create `.env.staging`:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/creative_platform
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
BLOB_READ_WRITE_TOKEN=...
SVIX_AUTH_TOKEN=...
```

**Start staging environment:**
```bash
docker compose up --pull always
```

The app runs on `http://localhost:3000` with hot-reload via bind mounts on `./src` and `./public`.

### 3. Production with Kubernetes

**Prerequisites:**
- Kubernetes cluster (EKS, GKE, DigitalOcean, etc.)
- `kubectl` configured
- Docker image pushed to GHCR (happens automatically on tag)

**Update secrets in `k8s-manifest.yaml`:**
Replace placeholder values in the `creative-platform-secrets` Secret with your production credentials.

**Deploy:**
```bash
kubectl apply -f k8s-manifest.yaml
```

**Monitor:**
```bash
kubectl -n creative-platform get pods
kubectl -n creative-platform logs deployment/creative-platform
kubectl -n creative-platform port-forward svc/creative-platform-service 3000:80
```

**Scale:**
```bash
kubectl -n creative-platform scale deployment creative-platform --replicas=5
```

The manifest includes:
- **Deployment:** 2 replicas (rolling updates, pod anti-affinity)
- **Service:** LoadBalancer on port 80 → pod port 3000
- **HPA:** Auto-scales 2–5 replicas based on CPU (70%) and memory (80%)
- **Liveness/Readiness probes:** Health checks via `/api/health`
- **Resource limits:** 256Mi–512Mi memory, 250m–500m CPU
- **Security:** Non-root user, read-only filesystem, dropped capabilities

## Deployment Workflow

### Development
```bash
git push origin feature-branch
# → CI workflow runs (lint, test, build)
```

### Release to Production
```bash
git tag v1.2.3
git push origin v1.2.3
# → Docker workflow runs:
#   1. Builds multi-stage image
#   2. Pushes to GHCR with tags: v1.2.3, 1.2, latest
#   3. Triggers Vercel deployment via webhook
#   4. Creates GitHub Release
```

### Staging Locally
```bash
docker compose up --pull always
# App on http://localhost:3000
# Bind-mounted src/ for hot reload
```

### Production on Kubernetes
```bash
kubectl apply -f k8s-manifest.yaml
# HPA auto-scales based on load
# Rolling updates with zero downtime
```

## Health Check Endpoint

The Dockerfile healthcheck and Kubernetes probes expect `/api/health` to return HTTP 200. Add this to your Next.js app:

**`src/app/api/health/route.ts`:**
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

## Troubleshooting

**Vercel deployment not triggered:**
- Ensure `VERCEL_TOKEN` secret is set
- Check GitHub Actions logs for the webhook response

**Docker Compose healthcheck fails:**
- Ensure `/api/health` endpoint exists
- Check logs: `docker compose logs app`

**Kubernetes pod stays in CrashLoopBackOff:**
- Check logs: `kubectl -n creative-platform logs deployment/creative-platform`
- Verify secrets are set: `kubectl -n creative-platform describe secret creative-platform-secrets`
- Check resource limits: `kubectl top pods -n creative-platform`

**Image pull fails:**
- Ensure GHCR credentials are configured: `kubectl create secret docker-registry ghcr-secret ...`
- Add `imagePullSecrets` to the Deployment spec if needed
