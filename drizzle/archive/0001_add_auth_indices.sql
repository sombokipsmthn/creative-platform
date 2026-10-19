-- Add indices to optimize auth queries
-- These indices significantly improve sign-in and session lookup performance

-- Primary index for email-based authentication lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Index for auth_user_id lookups (needed for Better Auth session validation)
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON users (auth_user_id);

-- Composite index for verification lookups (email + verified status)
CREATE INDEX IF NOT EXISTS users_email_verified_idx ON users (email, email_verified);

-- Index for handle lookups (used in public profile resolution)
CREATE INDEX IF NOT EXISTS users_handle_idx ON users (handle);

-- Compound index for common profile queries
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
