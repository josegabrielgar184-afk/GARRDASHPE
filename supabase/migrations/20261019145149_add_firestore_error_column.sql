-- Adds a server-side diagnostic column to capture the exact Firestore error
-- for pending transactions. This column is NEVER sent to the client.
ALTER TABLE arcade_credit_log
  ADD COLUMN IF NOT EXISTS firestore_error TEXT;