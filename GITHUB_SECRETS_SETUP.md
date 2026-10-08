# GitHub Actions Secrets Setup

This guide walks through configuring all necessary secrets for CI/CD deployments.

## Prerequisites

- Admin access to GitHub repository
- Database credentials
- Container registry credentials (if not using GitHub Container Registry)
- Auth secrets

## Quick Setup (GitHub CLI)

```bash
# Install GitHub CLI
# macOS: brew install gh
# Linux: https://cli.github.com/
# Windows: choco install gh

# Authenticate
gh auth login

# Set all secrets at once
gh secret set STAGING_DATABASE_URL --body "postgresql://user:[REDACTED]@host:5432/db"
gh secret set PRODUCTION_DATABASE_URL --body "postgresql://user:[REDACTED]@host:5432/db"
gh secret set BETTER_AUTH_SECRET --body "your_long_random_string_min_32_chars"
gh secret set ADMIN_METRICS_KEY --body "your_admin_metrics_key"

# Verify
gh secret list
```

## Manual Setup (GitHub Web UI)

### Step 1: Navigate to Settings

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. In left sidebar: **Secrets and variables** → **Actions**

### Step 2: Create Required Secrets

Click **New repository secret** for each:

#### Database Secrets

**STAGING_DATABASE_URL**
```
postgresql://kipsmthn_user:[REDACTED]@db-staging.example.com:5432/kipsmthn_staging
```

**PRODUCTION_DATABASE_URL**
```
postgresql://kipsmthn_user:[REDACTED]@db-prod.example.com:5432/kipsmthn_prod
```

#### Authentication Secrets

**BETTER_AUTH_SECRET**
```
generate: openssl rand -base64 32
Must be at least 32 characters
```

Generate a secure secret:

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))

# Online (development only)
# https://generate-random.org/
```

**ADMIN_METRICS_KEY**
```
generate: openssl rand -hex 32
```

#### Optional: Third-Party Service Secrets

**SNYK_TOKEN** (if using Snyk security scanning)
- Get from: https://app.snyk.io/account/settings
- Set to your Snyk API token

**SLACK_WEBHOOK_URL** (if using Slack notifications)
- Get from: Slack Workspace → Apps → Incoming Webhooks
- Format: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

**VERCEL_TOKEN** (if deploying to Vercel)
- Get from: https://vercel.com/account/tokens
- Create token with "Full Access"

## Secret Values Reference

### Database Credentials

Get from your database provider:

**PostgreSQL Connection String Format:**
```
postgresql://username:[REDACTED]@hostname:port/database?sslmode=require
```

**Where to get credentials:**

- **Heroku PostgreSQL**: App → Resources → Postgres → Settings → Database Credentials
- **AWS RDS**: Databases → Connectivity & Security → Endpoint
- **Digital Ocean**: Managed Databases → Connection Details
- **PlanetScale MySQL**: Passwords tab (if using MySQL)
- **Neon PostgreSQL**: Connection String

**Example for different providers:**

```
# Heroku
postgresql://user:[REDACTED]@ec2-xxx.compute-1.amazonaws.com:5432/database?sslmode=require

# AWS RDS
postgresql://admin:[REDACTED]@mydb.12345.us-east-1.rds.amazonaws.com:5432/kipsmthn

# Digital Ocean
postgresql://doadmin:[REDACTED]@db-postgresql-sfx0-prod-do-user-1234567-0.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require

# Neon
postgresql://user:[REDACTED]@ep-xyz.us-east-2.aws.neon.tech/kipsmthn?sslmode=require
```

### Authentication Secrets

**BETTER_AUTH_SECRET**
- Must be minimum 32 characters
- Use strong random string
- Keep same across environments for consistency

Generate multiple:

```bash
for i in {1..3}; do openssl rand -base64 32; done

# Output:
# aBcDeFgHiJkLmNoPqRsTuVwXyZ123456= (staging)
# 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p= (production)
# XyZ123456aBcDeFgHiJkLmNoPqRsT= (backup)
```

## Verifying Secrets

### List All Secrets

```bash
# GitHub CLI
gh secret list

# Output:
# STAGING_DATABASE_URL         Updated 2024-10-09 12:34:56 UTC
# PRODUCTION_DATABASE_URL      Updated 2024-10-09 12:34:56 UTC
# BETTER_AUTH_SECRET           Updated 2024-10-09 12:34:56 UTC
# ADMIN_METRICS_KEY            Updated 2024-10-09 12:34:56 UTC
```

### Test Secret in Action

```bash
# Add temporary test job to workflow
jobs:
  test-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Verify secrets exist
        run: |
          [[ -n "${{ secrets.STAGING_DATABASE_URL }}" ]] && echo "✓ STAGING_DATABASE_URL set"
          [[ -n "${{ secrets.PRODUCTION_DATABASE_URL }}" ]] && echo "✓ PRODUCTION_DATABASE_URL set"
          [[ -n "${{ secrets.BETTER_AUTH_SECRET }}" ]] && echo "✓ BETTER_AUTH_SECRET set"
          [[ -n "${{ secrets.ADMIN_METRICS_KEY }}" ]] && echo "✓ ADMIN_METRICS_KEY set"
```

## Secret Rotation

### Rotate Database Credentials

1. **Create new database user** with new password
2. **Update secret** in GitHub
3. **Test in staging** deployment
4. **Deploy to production**
5. **Verify all connections working**
6. **Remove old database user**

```bash
# PostgreSQL: Create new user
CREATE USER kipsmthn_new WITH PASSWORD 'new_secure_password';
GRANT ALL PRIVILEGES ON DATABASE kipsmthn TO kipsmthn_new;

# Update GitHub secret
gh secret set PRODUCTION_DATABASE_URL --body "postgresql://kipsmthn_new:[REDACTED]@host:5432/kipsmthn"

# Verify in next deployment
git tag v1.0.1 && git push --tags
```

### Rotate Auth Secrets

1. **Generate new secret** with `openssl rand -base64 32`
2. **Update BETTER_AUTH_SECRET** in GitHub
3. **Deploy to staging** first
4. **Test authentication** flows
5. **Deploy to production**
6. **Monitor for auth errors** in logs

**Note:** Existing sessions will be invalidated. Users will need to sign in again.

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update GitHub secret
gh secret set BETTER_AUTH_SECRET --body "$NEW_SECRET"

# Deploy
git tag v1.0.1 && git push --tags

# Monitor logs
kubectl logs -f deployment/creative-platform
```

### Rotate Metrics Key

```bash
NEW_METRICS_KEY=$(openssl rand -hex 32)
gh secret set ADMIN_METRICS_KEY --body "$NEW_METRICS_KEY"

# Update any scripts/dashboards that use this key
# No redeploy needed
```

## Using Secrets in Workflows

### Example: Deploy with Database Migration

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - name: Run database migration
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
        run: npm run db:migrate

      - name: Start container
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
          BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
        run: docker run \
          -e DATABASE_URL \
          -e BETTER_AUTH_SECRET \
          ghcr.io/org/creative-platform:latest
```

### Environment-Specific Secrets

GitHub Actions automatically provides:
- `secrets.GITHUB_TOKEN` - Auto-generated, no setup needed
- Custom secrets created above
- Environment secrets (if using environments)

**Use environment secrets for better isolation:**

```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - run: echo "Deploying to staging"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

  deploy-production:
    environment: production
    steps:
      - run: echo "Deploying to production"
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Troubleshooting

### Secret Not Found in Workflow

**Error:**
```
Unable to resolve action `github/actions/secret:VERSION`, repository not found
```

**Solution:**
1. Verify secret name spelling
2. Secret may not be visible in workflow logs (intentional)
3. Check workflow has permission to access secrets

### Timeout During Database Migration

**Error:**
```
connect ENOTFOUND db-staging.example.com
```

**Solution:**
1. Verify DATABASE_URL is correct
2. Check IP whitelisting (your GitHub runner IP)
3. Verify database is online
4. Test connection locally

### Auth Failures After Deployment

**Error:**
```
401 Unauthorized / Token expired
```

**Solution:**
1. Verify BETTER_AUTH_SECRET hasn't changed
2. Clear browser cookies
3. Check auth service logs
4. Verify all env vars correctly set

## Security Best Practices

### ✅ Do

- [ ] Rotate secrets every 90 days
- [ ] Use strong passwords (32+ chars)
- [ ] Limit secret access (use environments)
- [ ] Audit secret usage in logs
- [ ] Delete unused secrets

### ❌ Don't

- [ ] Commit secrets to repository
- [ ] Use simple/guessable passwords
- [ ] Share secrets in Slack/email
- [ ] Hardcode secrets in workflows
- [ ] Reuse secrets across environments

### Audit Secret Access

```bash
# View secret update history
gh api repos/{owner}/{repo}/actions/secrets \
  --paginate | jq '.[] | {name, updated_at}'

# Monitor for unauthorized access
# Set up GitHub audit logs alerts
```

## Complete Secret Checklist

Before deploying, ensure all secrets are set:

- [ ] `STAGING_DATABASE_URL` - PostgreSQL connection string
- [ ] `PRODUCTION_DATABASE_URL` - PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - 32+ char random string
- [ ] `ADMIN_METRICS_KEY` - Hex string for metrics endpoint
- [ ] `SNYK_TOKEN` (optional) - For vulnerability scanning
- [ ] `SLACK_WEBHOOK_URL` (optional) - For notifications
- [ ] `VERCEL_TOKEN` (optional) - For Vercel deployments

## Next Steps

1. Set all required secrets above
2. Test deployment: `git push origin develop`
3. Monitor logs: `gh run view --log` (if using GitHub CLI)
4. Verify app works: Visit staging URL
5. Create production tag: `git tag v0.1.0 && git push --tags`

## References

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
