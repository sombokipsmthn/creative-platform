# Docker Deployment & Registry Guide

Complete guide for building, testing, and pushing your creative platform to container registries.

## Quick Start

### Build Locally

```bash
# Build production image
docker build -t creative-platform:latest .

# Run locally
docker compose up -d

# Verify
docker ps
curl http://localhost:3000/api/health
```

### Push to Registry

```bash
# GitHub Container Registry (default)
docker tag creative-platform:latest ghcr.io/your-org/creative-platform:latest
docker push ghcr.io/your-org/creative-platform:latest

# Docker Hub
docker tag creative-platform:latest your-docker-hub/creative-platform:latest
docker push your-docker-hub/creative-platform:latest
```

## Registry Options

### 1. GitHub Container Registry (Recommended)

**Pros:**
- Free with GitHub Actions
- Integrated with repository
- Automatic cleanup policies

**Setup:**

```bash
# Login to GitHub Container Registry
echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

# Tag and push
docker tag creative-platform:latest ghcr.io/your-org/creative-platform:latest
docker push ghcr.io/your-org/creative-platform:latest

# Make public (optional)
# Settings → Packages and Data → Package Settings → Change Visibility
```

### 2. Docker Hub

**Pros:**
- Largest Docker image repository
- Good for public images

**Setup:**

```bash
# Login to Docker Hub
docker login -u your-username -p your-access-token

# Tag
docker tag creative-platform:latest your-username/creative-platform:latest

# Push
docker push your-username/creative-platform:latest
```

### 3. AWS ECR (Elastic Container Registry)

**Pros:**
- AWS-native, high availability
- Integrated with ECS/Fargate

**Setup:**

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin [REDACTED].dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag creative-platform:latest \
  [REDACTED].dkr.ecr.us-east-1.amazonaws.com/creative-platform:latest

# Push
docker push [REDACTED].dkr.ecr.us-east-1.amazonaws.com/creative-platform:latest
```

### 4. Private Registry (Self-Hosted)

**Setup with Docker Registry:**

```bash
# Start Docker Registry container
docker run -d -p 5000:5000 --name registry registry:2

# Tag
docker tag creative-platform:latest localhost:5000/creative-platform:latest

# Push
docker push localhost:5000/creative-platform:latest
```

## Image Tagging Strategy

Use semantic versioning and build metadata:

```bash
# Development build
docker tag creative-platform:dev ghcr.io/org/creative-platform:dev

# Version release
docker tag creative-platform:v1.2.3 ghcr.io/org/creative-platform:v1.2.3

# Latest stable
docker tag creative-platform:latest ghcr.io/org/creative-platform:latest

# Feature branch
docker tag creative-platform:feature-auth ghcr.io/org/creative-platform:feature-auth

# Build with timestamp
docker tag creative-platform:$(date +%Y%m%d-%H%M%S) \
  ghcr.io/org/creative-platform:$(date +%Y%m%d-%H%M%S)
```

## Docker Build Optimization

### Multi-Stage Build

The Dockerfile already uses multi-stage builds:

```dockerfile
# Stage 1: Dependencies (cached)
FROM node:22-alpine AS dependencies

# Stage 2: Builder (cached)
FROM node:22-alpine AS builder

# Stage 3: Runtime (minimal, ~200MB)
FROM node:22-alpine AS runtime
```

**Build times:**
- First build: ~5-10 minutes
- Subsequent builds (cached): ~1-2 minutes

### Build with Buildx (Faster Builds)

```bash
# Set up Buildx
docker buildx create --name mybuilder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/org/creative-platform:latest \
  --push \
  .
```

### Cache Optimization

```bash
# Use GitHub Actions cache (automatic in CI)
- uses: docker/build-push-action@v7
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Image Security

### Vulnerability Scanning

```bash
# Scan with Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ghcr.io/org/creative-platform:latest

# Generate report
trivy image --format json --output report.json \
  ghcr.io/org/creative-platform:latest
```

### Image Hardening

Current optimizations:
- Alpine Linux base (minimal attack surface)
- Non-root user (NODE)
- Read-only filesystem (optional)
- Health checks enabled

**Improve security:**

```dockerfile
# Add security headers
RUN addgroup -g 1000 nodejs && adduser -u 1000 -G nodejs -s /bin/sh -D nodejs
USER nodejs

# Read-only root filesystem
# docker run --read-only --tmpfs /tmp --tmpfs /app/.next ...
```

## Docker Compose Deployment

### Single-Host Staging

```bash
# Start with docker-compose.yml
docker compose up -d

# View logs
docker compose logs -f app pgbouncer postgres

# Scale app service
docker compose up -d --scale app=3

# Stop all services
docker compose down
```

### Multi-Stack Production

Use Docker Compose with environment overrides:

```bash
# Development (default)
docker compose up -d

# Staging with custom config
docker compose -f docker-compose.yml \
  -f docker-compose.staging.yml up -d

# Production
docker compose -f docker-compose.yml \
  -f docker-compose.prod.yml up -d
```

**Create `docker-compose.prod.yml`:**

```yaml
version: '3.9'

services:
  app:
    restart: always
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 1024M
    environment:
      NODE_ENV: production
      LOG_LEVEL: info

  pgbouncer:
    environment:
      PGBOUNCER_DEFAULT_POOL_SIZE: 50
      PGBOUNCER_MIN_POOL_SIZE: 20

  postgres:
    environment:
      POSTGRES_INITDB_ARGS: "-c shared_buffers=256MB -c max_connections=200"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2048M

volumes:
  postgres_data_prod:
```

## Kubernetes Deployment

### Create Kubernetes Manifest

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: creative-platform
  labels:
    app: creative-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: creative-platform
  template:
    metadata:
      labels:
        app: creative-platform
    spec:
      containers:
      - name: app
        image: ghcr.io/your-org/creative-platform:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: auth-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1024Mi"
            cpu: "1000m"

---
apiVersion: v1
kind: Service
metadata:
  name: creative-platform
spec:
  selector:
    app: creative-platform
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace creative-platform

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=database-url='postgresql://...' \
  --from-literal=auth-secret='your-secret' \
  -n creative-platform

# Deploy
kubectl apply -f k8s-deployment.yaml -n creative-platform

# Monitor
kubectl rollout status deployment/creative-platform -n creative-platform

# View pods
kubectl get pods -l app=creative-platform -n creative-platform

# Scale
kubectl scale deployment creative-platform --replicas=5 -n creative-platform
```

## CI/CD Pipeline Integration

### GitHub Actions (Automatic)

The `.github/workflows/docker-deploy.yml` handles:

1. **Trigger on tags**: `git tag v1.2.3 && git push --tags`
2. **Build & push**: Automatically pushes to GHCR
3. **Security scan**: Trivy scans for vulnerabilities
4. **Test image**: Verifies container health
5. **Deploy**: To staging (develop) or production (tags)

### Manual CI Setup

For other CI/CD platforms:

```bash
# Build
docker build -t creative-platform:ci-build .

# Test
docker run --rm creative-platform:ci-build npm test

# Scan
trivy image creative-platform:ci-build

# Push
docker push ghcr.io/org/creative-platform:ci-build
```

## Registry Cleanup & Maintenance

### Remove Old Images

```bash
# GitHub Container Registry
# Via GitHub UI: Settings → Packages and Data → Delete old images

# Docker Hub
docker image prune -a --filter "until=720h"

# Local cleanup
docker image rm creative-platform:old-tag
docker system prune -a
```

### Set Retention Policies

**GitHub Container Registry:**

```
Settings → Packages and Data → Package Retention Policy
- Keep at least: 1 version
- Delete if older than: 30 days
```

## Performance & Size Optimization

### Current Image Size

- **Dependencies stage**: ~150MB (cached)
- **Builder stage**: ~800MB (temporary)
- **Runtime stage**: ~200MB (final push)

### Reduce Image Size

```dockerfile
# Option 1: Use distroless base (experimental)
FROM node:22-alpine AS runtime
# Already optimized to ~200MB

# Option 2: Strip unnecessary files
RUN find . -type f -name "*.map" -delete
RUN npm cache clean --force
```

## Network Considerations

### Pull Speed Optimization

```bash
# Use regional mirror
docker pull ghcr.io/org/creative-platform:latest

# Pull from cache
docker pull --disable-content-trust ghcr.io/org/creative-platform:latest

# Bandwidth limit (if needed)
docker pull --rate-limit 10m ghcr.io/org/creative-platform:latest
```

### Private Registry Behind Firewall

```bash
# Configure Docker daemon to use proxy
# /etc/docker/daemon.json
{
  "registry-mirrors": ["https://your-private-registry:5000"]
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Image build fails | Check Docker daemon; increase timeout |
| Push fails "unauthorized" | Re-authenticate: `docker logout && docker login` |
| Image too large | Remove build artifacts; use .dockerignore |
| Slow pulls | Check network; use cache pull; reduce image layers |
| Registry connection timeout | Verify firewall rules; check registry health |

## Next Steps

1. **Choose registry**: GitHub Container Registry (default) or alternative
2. **Configure secrets**: Set in GitHub Actions or CI/CD platform
3. **Test build locally**: `docker build -t creative-platform:test .`
4. **Push test image**: `docker push ghcr.io/org/creative-platform:test`
5. **Deploy**: Use CI/CD or manual deployment with `docker compose`
