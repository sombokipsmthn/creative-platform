# Local development and database migrations

The normal development workflow runs Next.js directly on your Mac. Docker is optional and should only be used when explicitly testing a container or the local PostgreSQL service.

## Start the app

1. Ensure your local `.env.local` contains the intended Neon connection in `DATABASE_URL` (and, if used, `DATABASE_URL_UNPOOLED`).
2. Start the app with:

   ```bash
   npm run dev
   ```

3. Open http://localhost:3000.

The `dev` script does not start or stop Docker services. The Compose file remains available for explicit local-PostgreSQL or container testing.

## Run Drizzle migrations against Neon

Before running a migration, verify that `.env.local` targets the intended Neon database, **`neondb`**, and not the separate `kipsmthn` database. Never print or share the full connection string.

Useful commands:

```bash
npm run db:generate
npm run db:migrate
```

Use `npm run db:deploy` only after checking the current reconciliation script and confirming that the target database is correct; it runs migration reconciliation before applying migrations. Do not run seed, reconciliation, or migration commands against an ambiguous database target.

If both `DATABASE_URL_UNPOOLED` and `DATABASE_URL` are set, the Drizzle config prefers `DATABASE_URL_UNPOOLED`. Ensure both point to the intended Neon database, or unset the unpooled variable for the session if it points elsewhere.

## Docker is opt-in

Do not use Docker for routine Next.js development or Neon migrations. Use Docker Compose only when a task explicitly requires container-specific validation or the local PostgreSQL service. Do not delete Docker configuration or volumes as part of ordinary development setup.
