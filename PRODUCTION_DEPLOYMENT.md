# Production Deployment Guide

This guide covers deploying your creative platform to production using Docker, PgBouncer, and automated CI/CD pipelines.

## Prerequisites

- Docker & Docker Compose installed
- GitHub Actions configured with production secrets
- PostgreSQL 16+ with adequate capacity (CPU/RAM/storage)
- Container registry access (GitHub Container Registry or Docker Hub)
- Domain name and SSL certificates configured

## Deployment Architecture

```
GitHub Repository
    ↓ [CI/CD Pipeline]
    ├─→ Lint & Test (ci.yml)
    ├─→ Security Audit & Secret Scan
    ├─→ Build Docker Image
    ├─→ Vulnerability Scan (Trivy)
    └─→ Test Image Health
         ↓ [On main/develop]
         └─→ Staging Deployment
         ↓ [On version tag]
         └─→ Production Deployment
              ├─→ Database Migration
              ├─→ Health Verification
              └─→ GitHub Release
```

## GitHub Secrets Configuration

Before deploying, configure these secrets in your GitHub repository:

1. **Container Registry**
   ```
   Already available: GITHUB_TOKEN (default GitHub Actions secret)
   ```

2. **Database Credentials**
   ```
   STAGING_DATABASE_URL=postgresql://user:[REDACTED]@db-staging:5432/kipsmthn_staging
   PRODUCTION_DATABASE_URL=postgresql://user:[REDACTED]@db-prod:5432/kipsmthn_prod
   ```

3. **Authentication**
   ```
   BETTER_AUTH_SECRET=your_long_random_secret_here_min_32_chars
   ```

4. **Optional: Security & Monitoring**
   ```
   SNYK_TOKEN=your_snyk_api_token_for_vulnerability_scanning
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

### Set Secrets in GitHub

```bash
# Using GitHub CLI
gh secret set STAGING_DATABASE_URL --body "postgresql://..."
gh secret set PRODUCTION_DATABASE_URL --body "postgresql://..."
gh secret set BETTER_AUTH_SECRET --body "your_secret"
```

## Deployment Process

### 1. Staging Deployment (Automatic)

Pushes to `develop` branch trigger automatic staging deployment:

```bash
# Push to develop
git add .
git commit -m "feat: add new feature"
git push origin develop
```

**Workflow:**
1. Lint & Test
2. Type Check
3. Security Audit
4. Build Docker Image
5. Test Image Health
6. Deploy to Staging
7. Run Database Migrations
8. Verify Deployment

### 2. Production Deployment (Tag-Based)

Production requires creating a semantic version tag:

```bash
# Create and push version tag
git tag v0.2.0
git push origin v0.2.0
```

**Workflow:**
1. All staging checks + security scans
2. Deploy to Production
3. Run database migrations
4. Health verification (120 second timeout)
5. Create GitHub Release with deployment info

## Docker Compose for Production

Use the provided `docker-compose.yml` for single-host production:

```bash
# Pull latest image
docker compose pull

# Start services with production config
docker compose -f docker-compose.yml up -d

# Verify services
docker compose ps
docker compose logs -f app
```

### Multi-Node Deployment (Kubernetes)

For multi-region or high-availability production, use Kubernetes:

```bash
# Apply manifests
kubectl apply -f k8s-manifest.yaml

# Monitor deployment
kubectl rollout status deployment/creative-platform
kubectl get pods -l app=creative-platform
```

## Pre-Deployment Checklist

- [ ] All tests passing on `develop` branch
- [ ] Security audit showing no critical vulnerabilities
- [ ] Database migrations tested in staging
- [ ] SSL certificates valid
- [ ] PgBouncer connection pool configured
- [ ] Environment variables set in GitHub Secrets
- [ ] Backup of production database created
- [ ] Rollback plan documented

## Database Migration Strategy

### Staging Environment

Migrations run automatically after deployment:

```bash
# Manual migration for testing
npm run db:migrate -- --env staging
```

### Production Environment

**Always backup before migration:**

```bash
# 1. Create backup
pg_dump $PRODUCTION_DATABASE_URL > backup-$(date +%s).sql

# 2. Deploy new version (triggers migration)
git tag v1.0.0 && git push origin v1.0.0

# 3. Monitor deployment
kubectl logs -f deployment/creative-platform
```

**If migration fails:**

```bash
# Rollback using previous tag
git tag v0.9.9 && git push origin v0.9.9

# Restore database from backup
psql $PRODUCTION_DATABASE_URL < backup-timestamp.sql
```

## Performance Monitoring

### Check PgBouncer Statistics

```bash
# Inside PostgreSQL container
docker compose exec postgres psql -U kipsmthn -d kipsmthn \
  -h pgbouncer -p 6432 -c "SHOW STATS;"

# Connection details
docker compose exec postgres psql -U kipsmthn -d kipsmthn \
  -h pgbouncer -p 6432 -c "SHOW CLIENTS;"
```

### Monitor Query Performance

```bash
# Get database metrics
curl -H "x-admin-key: $ADMIN_METRICS_KEY" \
  https://kipsmthn.com/api/metrics/queries

# Reset metrics
curl -X POST -H "x-admin-key: $ADMIN_METRICS_KEY" \
  https://kipsmthn.com/api/metrics/queries/reset
```

### Container Health

```bash
# Check container status
docker compose ps

# View logs
docker compose logs app --tail 100

# Run healthcheck manually
docker compose exec app npm run healthcheck
```

## Scaling Configuration

### Horizontal Scaling (Multiple App Instances)

With Kubernetes or Docker Swarm:

```yaml
# Scale to 3 replicas
replicas: 3

# Load balancing
service:
  type: LoadBalancer
  ports:
    - 80:3000
    - 443:3000
```

### Database Connection Pool Tuning

Adjust in `docker-compose.yml` based on load:

```yaml
environment:
  PGBOUNCER_DEFAULT_POOL_SIZE: 50      # Increase for more concurrent users
  PGBOUNCER_MAX_CLIENT_CONN: 2000      # Increase client capacity
  PGBOUNCER_MIN_POOL_SIZE: 20          # Keep more warm connections
```

## Monitoring & Alerting

### Set Up Log Aggregation

```bash
# Stream logs from all containers
docker compose logs -f --all

# Export logs to file
docker compose logs > production-logs-$(date +%s).log
```

### Configure Alerts

Set alerts for:
- Container restart (health check failures)
- PgBouncer connection pool exhaustion
- Database query latency > 1s
- Memory usage > 80%
- Disk space < 10%

## Rollback Procedure

### If Deployment Fails

```bash
# 1. Identify previous stable tag
git tag -l | sort -V

# 2. Trigger rollback
git tag rollback-v1.0.0 v0.9.9
git push origin rollback-v1.0.0

# 3. Monitor rollback progress
kubectl rollout status deployment/creative-platform
# or
docker compose pull && docker compose restart
```

## Security Considerations

### Environment Variables

Never commit secrets to repository:

```bash
# ❌ WRONG
DATABASE_URL=postgresql://user:[REDACTED]@host:5432/db

# ✅ RIGHT
# Set in GitHub Secrets, used during deployment
echo ${{ secrets.PRODUCTION_DATABASE_URL }}
```

### Image Scanning

Every build scans for vulnerabilities:

```bash
# Manual vulnerability scan
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image ghcr.io/your-org/creative-platform:latest
```

### Network Security

- Use HTTPS/TLS for all connections
- Restrict database access to app containers only
- Enable firewall rules for PgBouncer (port 6432)
- Use VPN for admin access to metrics endpoint

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Deployment timeout | Slow health check response | Increase health check timeout in workflow |
| Database migration fails | Schema conflicts | Review migration file, backup DB, retry |
| PgBouncer exhausted | Too many connections | Increase pool_size or max_client_conn |
| Image pull fails | Registry auth missing | Verify GITHUB_TOKEN has package read access |
| OOM (Out of Memory) | Insufficient resources | Scale up container resources or add memory |

### Debug Deployment

```bash
# Check GitHub Actions logs
# Open: https://github.com/your-org/creative-platform/actions

# View deployment events
kubectl describe deployment creative-platform

# Check pod logs
kubectl logs -f pod/creative-platform-xxxxx

# Test database connection
docker compose exec app npm run db:check-connection
```

## Maintenance Windows

Schedule maintenance during low-traffic periods:

- **Database backups**: Daily at 2 AM UTC
- **Schema migrations**: Tag-based (requires manual deploy)
- **Dependency updates**: Monthly security review
- **SSL certificate renewal**: 30 days before expiry

## Next Steps

1. **Configure GitHub Actions secrets** as documented above
2. **Test staging deployment** with `git push origin develop`
3. **Create first production release** with `git tag v0.1.0`
4. **Set up monitoring dashboards** for key metrics
5. **Document your specific deployment infrastructure** (add links to Kubernetes configs, etc.)

## Support & Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/runtime-config.html)
- [PgBouncer Administration](https://www.pgbouncer.org/)
