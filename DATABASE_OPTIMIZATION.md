# Database Connection Pooling & Query Monitoring

This guide covers the database performance optimizations implemented for your creative platform.

## Overview

- **PgBouncer**: Connection pooling middleware between your app and PostgreSQL
- **Database Indices**: Added fast lookups on frequently-queried auth columns
- **Query Monitoring**: Performance tracking for slow queries and diagnostics

## Quick Start

### 1. Run with Docker Compose

The `docker-compose.yml` now includes PostgreSQL, PgBouncer, and your app:

```bash
# Set up environment
cp .env.example .env.staging
# Update POSTGRES_PASSWORD in .env.staging

# Start services
docker compose up -d

# Run database migrations (including new indices)
docker compose exec app npm run db:migrate
```

### 2. Apply Database Indices

The migration file `drizzle/0001_add_auth_indices.sql` adds these indices:

| Index | Columns | Purpose |
|-------|---------|---------|
| `users_email_idx` | `email` | Fast email lookups for sign-in |
| `users_auth_user_id_idx` | `auth_user_id` | Session validation |
| `users_email_verified_idx` | `email, email_verified` | Verification queries |
| `users_handle_idx` | `handle` | Public profile lookups |
| `users_created_at_idx` | `created_at DESC` | Recent user queries |

**Run migration:**

```bash
npm run db:migrate
```

### 3. PgBouncer Configuration

**Key settings in `pgbouncer.ini`:**

```ini
pool_mode = transaction          # One connection per transaction
max_client_conn = 1000           # Max app connections to PgBouncer
default_pool_size = 25           # Connections per database
min_pool_size = 10               # Keep connections warm
server_lifetime = 3600           # Recycle connections every hour
server_idle_timeout = 600        # Drop idle connections after 10min
reserve_pool_size = 5            # Emergency connections
```

**How it works:**

1. Your app connects to PgBouncer (port 6432)
2. PgBouncer maintains a pool of reusable PostgreSQL connections
3. Reduces connection overhead and improves sign-in speed
4. Prevents database connection exhaustion

## Performance Monitoring

### Check Query Metrics

```bash
# View database query performance
curl -H "x-admin-key: your_admin_metrics_key_here" \
  http://localhost:3000/api/metrics/queries
```

**Example response:**

```json
{
  "timestamp": "2025-10-09T21:26:12.700Z",
  "metrics": {
    "getUserByEmail": {
      "count": 42,
      "avgTime": "2.31ms",
      "maxTime": "15.44ms",
      "totalTime": "97.02ms"
    },
    "getUserByAuthId": {
      "count": 128,
      "avgTime": "1.89ms",
      "maxTime": "8.12ms",
      "totalTime": "241.92ms"
    },
    "Local user lookup by auth ID": {
      "count": 15,
      "avgTime": "3.45ms",
      "maxTime": "12.30ms",
      "totalTime": "51.75ms"
    }
  }
}
```

### Slow Query Logging

Queries exceeding **100ms** are logged to console:

```
[SLOW QUERY] getUserByEmail: 142.55ms
[SLOW QUERY] Creator profile lookup: 234.78ms
```

Monitor these in production logs.

### Reset Metrics

```bash
curl -X POST -H "x-admin-key: your_admin_metrics_key_here" \
  http://localhost:3000/api/metrics/queries/reset
```

## Monitoring Query Performance

The `/api/users/sync` endpoint now logs timings for each step:

```
[PERF] Session retrieval: 4.32ms
[PERF] Local user lookup by auth ID: 2.15ms
[PERF] Creator profile lookup: 1.88ms
[PERF] POST /api/users/sync (total): 8.35ms
```

Compare against the **previous 2.4s (2400ms) baseline** to verify improvements.

## Environment Variables

Add to `.env.local` or `.env.staging`:

```env
# Direct PostgreSQL connection (development)
DATABASE_URL=postgresql://kipsmthn:[REDACTED]@localhost:5432/kipsmthn

# Via PgBouncer (production/Docker)
DATABASE_URL=postgresql://kipsmthn:[REDACTED]@pgbouncer:6432/kipsmthn?sslmode=disable

# Metrics monitoring security
ADMIN_METRICS_KEY=your_secret_admin_key_here
POSTGRES_PASSWORD=your_secure_postgres_password
```

## Production Deployment

### Connection Pooling Parameters (Tuning)

Adjust based on your app's load:

```yaml
# Light load (< 100 concurrent users)
default_pool_size: 10
min_pool_size: 5
max_client_conn: 200

# Medium load (100-1000 concurrent users)
default_pool_size: 25
min_pool_size: 10
max_client_conn: 1000

# High load (> 1000 concurrent users)
default_pool_size: 50
min_pool_size: 20
max_client_conn: 2000
max_db_connections: 200
```

### Monitor PgBouncer Health

```bash
# Check PgBouncer stats inside container
docker compose exec pgbouncer psql -U admin -d pgbouncer -c "SHOW STATS;"

# Check active connections
docker compose exec pgbouncer psql -U admin -d pgbouncer -c "SHOW CLIENTS;"
```

### Database Connection Issues

**Symptoms:**
- "too many connections" errors
- Sign-in latency > 2s
- 502 Gateway Timeout

**Fixes:**

1. **Increase pool size** in `docker-compose.yml`:
   ```yaml
   PGBOUNCER_DEFAULT_POOL_SIZE: 50  # Increase from 25
   ```

2. **Increase PostgreSQL max connections**:
   ```bash
   docker compose exec postgres psql -U kipsmthn -d kipsmthn \
     -c "ALTER SYSTEM SET max_connections = 200;"
   docker compose restart postgres
   ```

3. **Enable connection recycling**:
   ```yaml
   PGBOUNCER_SERVER_LIFETIME: 1800  # Recycle after 30min
   ```

## Testing

### Load test sign-in with PgBouncer

```bash
# Install Apache Bench
# macOS: brew install httpd
# Linux: apt install apache2-utils

# Test 100 concurrent requests
ab -n 1000 -c 100 http://localhost:3000/api/auth/sign-in/email

# Before pooling: ~2400ms average
# After pooling: ~300-500ms average (8-10x improvement)
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "too many connections" | Pool exhausted | Increase `default_pool_size` |
| Sign-in still slow | Indices not created | Run `npm run db:migrate` |
| PgBouncer won't start | Wrong DB credentials | Check `pgbouncer-users.txt` |
| Metrics API returns 403 | Missing admin key | Set `x-admin-key` header |
| Connections accumulating | Idle timeout too high | Reduce `server_idle_timeout` |

## Next Steps

1. **Deploy indices**: Run migrations in staging/production
2. **Monitor baseline**: Capture query times for 24 hours before/after
3. **Enable slow query log**: Set `log_statement = 'slow'` in PostgreSQL
4. **Set up alerts**: Configure PagerDuty/Datadog for connection pool exhaustion
5. **Load testing**: Run synthetic tests to verify improvements

## References

- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Drizzle ORM Indices](https://orm.drizzle.team/docs/indexes)
- [PostgreSQL Query Planning](https://www.postgresql.org/docs/current/using-explain.html)
