BEGIN;

DO $$
DECLARE
  protected_user_id TEXT;
BEGIN
  SELECT id
  INTO protected_user_id
  FROM users
  WHERE lower(email) = lower('somboriot@gmail.com');

  IF protected_user_id IS NULL THEN
    RAISE EXCEPTION
      'PURGE ABORTED: protected user somboriot@gmail.com was not found.';
  END IF;

  RAISE NOTICE 'Protected user ID: %', protected_user_id;

  -- Quote items belonging to other creators
  DELETE FROM quote_items
  WHERE quote_id IN (
    SELECT id FROM quotes
    WHERE creator_id <> protected_user_id
  );

  -- Invoice items belonging to other creators
  DELETE FROM invoice_items
  WHERE invoice_id IN (
    SELECT id FROM invoices
    WHERE creator_id <> protected_user_id
  );

  -- Invoices belonging to other creators
  DELETE FROM invoices
  WHERE creator_id <> protected_user_id;

  -- Quotes belonging to other creators
  DELETE FROM quotes
  WHERE creator_id <> protected_user_id;

  -- Projects belonging to other creators
  DELETE FROM projects
  WHERE creator_id <> protected_user_id;

  -- Clients belonging to other creators
  DELETE FROM clients
  WHERE creator_id <> protected_user_id;

  -- Creator profiles belonging to other users
  DELETE FROM creator_profiles
  WHERE user_id <> protected_user_id;

  -- Finally remove all other application users
  DELETE FROM users
  WHERE id <> protected_user_id;

  RAISE NOTICE 'PURGE COMPLETE.';
END $$;

COMMIT;
