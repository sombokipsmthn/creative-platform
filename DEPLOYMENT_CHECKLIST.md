# Deployment Checklist & Runbook

Complete checklist and runbook for staging and production deployments.

## Pre-Deployment (All Environments)

### Code Quality
- [ ] All tests passing: `npm test`
- [ ] No lint errors: `npm run lint`
- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] No security vulnerabilities: `npm run audit:production`
- [ ] All code reviewed (pull request)
- [ ] Branch status checks passed

### Database
- [ ] New migrations written (if schema changes)
- [ ] Migrations tested on local database
- [ ] Backup created (production only)
- [ ] Migration rollback plan documented
- [ ] Database version compatible (PostgreSQL 14+)

### Configuration
- [ ] All environment variables defined
- [ ] GitHub secrets configured (see GITHUB_SECRETS_SETUP.md)
- [ ] SSL certificates valid and configured
- [ ] DNS records pointing to deployment
- [ ] Load balancer configured (if applicable)

### Monitoring
- [ ] Logs aggregation enabled
- [ ] Health checks configured
- [ ] Alerts configured for critical issues
- [ ] Dashboards set up for key metrics
- [ ] On-call schedule updated

## Staging Deployment (Automatic on `develop`)

### Pre-Deployment
- [ ] Development branch is stable
- [ ] Code merged and ready for testing
- [ ] Feature complete and tested locally
- [ ] No known critical bugs

### Execute Deployment
```bash
# 1. Push to develop branch
git add .
git commit -m "feat: new feature"
git push origin develop

# 2. Monitor GitHub Actions
# https://github.com/YOUR_ORG/creative-platform/actions

# 3. Wait for workflow completion
# ├─ Lint ✓
# ├─ Test ✓
# ├─ TypeCheck ✓
# ├─ Security Audit ✓
# ├─ Build Docker Image ✓
# ├─ Test Image Health ✓
# └─ Deploy to Staging ✓

# 4. Check deployment status
gh run list --branch develop --limit 1

# 5. View logs if failed
gh run view [RUN_ID] --log
```

### Post-Deployment Verification
```bash
# 1. Verify staging app is up
curl https://staging.kipsmthn.com/api/health

# 2. Check container logs
docker logs creative-platform-staging | tail -50

# 3. Test core workflows
# - [ ] Sign up new account
# - [ ] Sign in with email
# - [ ] Create a project
# - [ ] Upload media
# - [ ] Check database migrations applied

# 4. Monitor for errors
# - [ ] No 5xx errors in logs
# - [ ] No database connection errors
# - [ ] Response times normal (< 1s)

# 5. Run smoke tests
npm run test -- --grep "smoke"

# 6. Check metrics
curl -H "x-admin-key: $ADMIN_METRICS_KEY" \
  https://staging.kipsmthn.com/api/metrics/queries
```

### Rollback (if needed)
```bash
# Revert to previous deployment
git revert [COMMIT_HASH]
git push origin develop

# Monitor rollback
gh run view [NEW_RUN_ID] --log

# Verify previous version running
curl https://staging.kipsmthn.com/api/health
```

## Production Deployment (Manual via Git Tag)

### 24-Hour Pre-Deployment

- [ ] Feature frozen (no new features 24h before)
- [ ] All staging tests passed
- [ ] Performance tested (load testing complete)
- [ ] Security review completed
- [ ] Product/Design sign-off on changes
- [ ] Customer communications planned (if needed)

### 1-Hour Pre-Deployment

- [ ] Full database backup taken
```bash
# PostgreSQL backup
pg_dump $PRODUCTION_DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup size is reasonable
ls -lh backup-*.sql

# Test restore in staging
pg_restore -d kipsmthn_staging < backup-*.sql
```

- [ ] On-call engineer assigned
- [ ] Slack/team notified
- [ ] Rollback plan reviewed
- [ ] All monitoring dashboards open
- [ ] Load balancer/traffic verified

### Execute Production Deployment

```bash
# 1. Create semantic version tag
# Format: vMAJOR.MINOR.PATCH (e.g., v1.2.3)
git tag v1.2.3

# 2. Push tag to GitHub
git push origin v1.2.3

# 3. Monitor deployment
gh run list --branch v1.2.3 | head -1
gh run view [RUN_ID] --log

# Expected workflow:
# ├─ Build & Push Image ✓
# ├─ Security Scan (Trivy) ✓
# ├─ Test Image Health ✓
# ├─ Run Migrations ✓
# ├─ Deploy to Production ✓
# ├─ Health Verification ✓
# ├─ Create Release ✓
# └─ Notify Team ✓
```

### Parallel Monitoring During Deployment

Keep open and monitor in real-time:

```bash
# Terminal 1: Watch deployment progress
gh run view [RUN_ID] --log --follow

# Terminal 2: Monitor application logs
docker logs -f $(docker ps -q -f "label=version=v1.2.3")
# or for Kubernetes
kubectl logs -f deployment/creative-platform -n production

# Terminal 3: Watch database metrics
watch -n 2 'curl -H "x-admin-key: $ADMIN_METRICS_KEY" \
  https://kipsmthn.com/api/metrics/queries | jq .'

# Terminal 4: Monitor error rates
watch -n 2 'kubectl get events -n production --sort-by=.metadata.creationTimestamp'
```

### Post-Deployment Verification (Critical)

**Immediately after deployment:**

```bash
# 1. Health check
for i in {1..5}; do
  curl https://kipsmthn.com/api/health
  echo "---"
  sleep 2
done

# 2. Check error logs
kubectl logs deployment/creative-platform -n production | grep -i error | head -20

# 3. Verify critical paths
curl -X POST https://kipsmthn.com/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'

# 4. Test database connection
kubectl exec -it pod/creative-platform-xxxxx -c app -- \
  npm run db:check-connection

# 5. Monitor slow queries
curl -H "x-admin-key: $ADMIN_METRICS_KEY" \
  https://kipsmthn.com/api/metrics/queries

# 6. Check resource utilization
kubectl top nodes
kubectl top pods -n production

# 7. Review deployment events
kubectl describe deployment creative-platform -n production
```

**Within 5 minutes:**
- [ ] No 5xx errors in logs
- [ ] Database connections stable
- [ ] Response times < 1s
- [ ] Memory usage normal (< 80%)
- [ ] CPU usage normal (< 70%)

**Within 30 minutes:**
- [ ] Run full smoke test suite
- [ ] Monitor error rates (should be < 0.1%)
- [ ] Check business metrics (signups, sign-ins)
- [ ] Verify all API endpoints responding

### Emergency Rollback Procedure

If critical issues detected:

```bash
# 1. Immediate notification
# Ping team, post in #incidents channel

# 2. Identify previous stable version
git tag -l | sort -V | tail -3
# Example: v1.2.2, v1.2.1, v1.2.0

# 3. Create rollback tag
git tag v1.2.3-rollback v1.2.2
git push origin v1.2.3-rollback

# 4. Monitor rollback deployment
gh run view [NEW_RUN_ID] --log --follow

# 5. Verify previous version running
curl https://kipsmthn.com/api/health

# 6. Restore database if corrupted
psql $PRODUCTION_DATABASE_URL < backup-2024XXXX-XXXXXX.sql

# 7. Update team
# Post rollback status and next steps

# 8. Post-mortem
# Schedule post-mortem meeting within 24 hours
```

**Time to rollback should be < 10 minutes**

## Deployment Troubleshooting

### Build Failures

**Error: "Docker build failed"**
```bash
# Solution: Check build logs
docker build -t test . 2>&1 | tail -50

# Common causes:
# - npm install timeout (increase timeout in workflow)
# - Missing secrets (check GitHub Secrets)
# - Disk space (clear Docker cache: docker system prune)
```

**Error: "Next.js build failed"**
```bash
# Check Next.js build locally
npm run build

# Common causes:
# - TypeScript errors (npx tsc --noEmit)
# - Missing environment variables
# - Static generation errors
```

### Deployment Failures

**Error: "Health check failed"**
```bash
# 1. Check container logs
docker logs creative-platform-xxxxx

# 2. Verify port is open
netstat -ln | grep 3000

# 3. Test endpoint locally
curl http://localhost:3000/api/health

# 4. Check dependencies
docker inspect creative-platform-xxxxx
```

**Error: "Database connection failed"**
```bash
# 1. Verify DATABASE_URL
echo $DATABASE_URL

# 2. Test connection
psql $DATABASE_URL -c "SELECT 1;"

# 3. Check credentials in GitHub Secrets
gh secret list | grep DATABASE

# 4. Verify firewall/network
curl -v telnet://db-host:5432
```

**Error: "Migration failed"**
```bash
# 1. Check migration files
find drizzle -name "*.sql" | sort

# 2. Review migration manually
cat drizzle/0001_add_auth_indices.sql

# 3. Test migration locally
npm run db:migrate

# 4. If rollback needed, revert migrations
npm run db:migrate:down

# 5. Create new migration file
npm run db:generate
```

## Performance Baseline

Track deployment performance:

```bash
# Record deployment metrics
cat > deployment-metrics.log <<EOF
Deployment: v1.2.3
Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Build time: XX min
Migration time: XX sec
Health check time: XX sec
First error: (timestamp) - (description)
Peak memory: XX MB
Peak CPU: XX%
EOF

# Compare across deployments
diff deployment-metrics.log previous-deployment-metrics.log
```

## Sign-Off

Production deployments require sign-off from:

- [ ] Engineering Lead
- [ ] Product Manager (if user-facing changes)
- [ ] DevOps/Infrastructure (if infrastructure changes)
- [ ] Security (if security-related changes)

**Approval flow:**
```
Code Review ✓ → Staging Tested ✓ → Sign-offs Collected ✓ → Tag Created ✓ → Deploy
```

## Post-Deployment (24 Hours)

- [ ] Monitor error rates (should be ≤ 0.1%)
- [ ] Review database performance
- [ ] Check for any spike in support tickets
- [ ] Collect team feedback
- [ ] Update documentation if needed
- [ ] Schedule retrospective if any issues

## Next Deployment Commands

### Quick Staging Deploy
```bash
git push origin develop
```

### Quick Production Deploy
```bash
git tag v1.2.3 && git push origin v1.2.3
```

### Emergency Rollback
```bash
git tag v1.2.3-rollback [PREVIOUS_TAG]
git push origin v1.2.3-rollback
```

## Contacts

- **On-Call Engineer**: [Phone/Slack]
- **Database Admin**: [Contact]
- **Infrastructure Lead**: [Contact]
- **Product Manager**: [Contact]
- **Incident Channel**: #incidents

## References

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Database Optimization](./DATABASE_OPTIMIZATION.md)
- [GitHub Secrets Setup](./GITHUB_SECRETS_SETUP.md)
