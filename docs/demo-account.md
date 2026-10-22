# Demo creator account and data lifecycle

This guide applies to the current `dev` branch and a dedicated demo/test database. Do not assume a special branch or point demo testing at production data. Always verify the actual database identity before seeding or deleting anything; `DEMO_DATABASE_URL` must not silently fall back to `DATABASE_URL`.

## Seed the demo workspace

Set the following in the local demo environment:

- `DEMO_DATABASE_URL`: required; the dedicated development/demo PostgreSQL database. The seed refuses to fall back to `DATABASE_URL`.
- `DEMO_CREATOR_EMAIL`: optional; defaults to `demo.creator@kipsmthn.test`.
- `DEMO_CREATOR_PASSWORD`: required, at least 8 characters.
- `DEMO_CREATOR_NAME`: optional; defaults to `KIPSMTHN Demo Creator`.

Run `npm run db:seed:demo`.

The seed uses Better Auth to create the creator identity, then creates a clearly labelled client, project, calendar item (the project start/end dates), quote and line item, invoice and line item, gallery, and contract. The quote/invoice/contract are explicitly labelled as samples and must not be treated as real offers or payment requests. The gallery starts empty and does not upload or invent client images.

The script is idempotent for the demo project slug: if the demo project already exists for that creator, it leaves the existing workspace untouched.

## Account deletion

`DELETE /api/account` deletes the currently authenticated creator only. The request body must be:

```json
{ "confirmation": "DELETE MY CREATOR ACCOUNT" }
```

The handler gathers that creator's gallery and project media storage paths, deletes those objects through the existing gallery storage provider, and only then deletes the creator's database account in a transaction. The users table's cascading foreign keys remove Better Auth sessions/accounts/passkeys and creator-owned rows. Global equipment catalogue records are intentionally preserved.

If storage deletion fails, the database account is not deleted. This is permanent; there is no undo. UI should explain the impact and require the exact confirmation phrase before calling this endpoint.

## Before using in a shared demo deployment

1. Use a dedicated demo database and storage bucket/prefix.
2. Confirm all creator-owned tables have foreign keys that cascade from `users.id` or are explicitly cleaned up.
3. Confirm the storage provider credentials point to the demo bucket.
4. Add a UI confirmation flow that calls `DELETE /api/account` only after the creator types the confirmation phrase.
5. Test deletion with an account containing gallery and project uploads, then verify unrelated creators and equipment remain.


See [Project Handbook](./PROJECT-HANDBOOK.md) for the current authentication/onboarding decisions and database safety rules.