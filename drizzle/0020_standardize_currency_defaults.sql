/*
  Standardize currency defaults across schema.
  
  Previously: quotes defaulted to "KES", invoices defaulted to "USD".
  Now: All currency fields consistently default to "KES" (Kenya Shilling).
  
  Impact:
  - New invoices created without explicit currency will now default to KES instead of USD.
  - Prevents quote→invoice currency mismatches.
  - Existing invoices with USD currency are preserved.
  
  Migration Steps:
  1. Apply this migration to update the invoices table default.
  2. Update API route handlers that normalize currency (src/app/api/invoices/route.ts).
  3. Test quote→invoice conversion to ensure currency inheritance works correctly.
*/

-- Update invoices table currency default from USD to KES
ALTER TABLE invoices 
ALTER COLUMN currency SET DEFAULT 'KES';

-- Optional: Fix any existing USD-defaulted invoices that should be KES
-- Uncomment if needed (preserves existing data, updates only schema default):
-- UPDATE invoices SET currency = 'KES' WHERE currency = 'USD' AND quoteId IS NOT NULL;
