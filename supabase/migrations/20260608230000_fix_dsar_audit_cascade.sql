-- GDPR Art. 5(2) Accountability Fix
-- =============================================================================
-- Root cause: dsar_requests.user_id REFERENCES auth.users(id) ON DELETE CASCADE
-- means that when adminClient.auth.admin.deleteUser() is called during permanent
-- account erasure, the DSAR audit record itself is also cascade-deleted.  The
-- subsequent .update() call (adding deletion_completed_at / admin_notes) runs on a
-- now-deleted row and silently no-ops.  The result is zero audit evidence that the
-- deletion request was ever completed — a clear GDPR Art. 5(2) violation.
--
-- Fix:
--   1. Drop the CASCADE FK and replace it with ON DELETE SET NULL.
--   2. Remove the NOT NULL constraint so the column can hold NULL after the auth
--      user is erased.
--   3. Add a deleted_user_id column (no FK) that is written before erasure so the
--      UUID is preserved for audit purposes after user_id becomes NULL.
-- =============================================================================

-- Step 1: Add deleted_user_id audit column (no FK — must survive user deletion).
ALTER TABLE public.dsar_requests
  ADD COLUMN IF NOT EXISTS deleted_user_id uuid;

COMMENT ON COLUMN public.dsar_requests.deleted_user_id IS
  'Preserves the original auth.users UUID after the row''s user_id FK is NULLed on '
  'account deletion.  Written by the deletion handler immediately before '
  'auth.admin.deleteUser() is called so the audit trail survives the CASCADE.';

-- Step 2: Drop the existing CASCADE FK on user_id.
ALTER TABLE public.dsar_requests
  DROP CONSTRAINT IF EXISTS dsar_requests_user_id_fkey;

-- Step 3: Allow user_id to be NULL (the FK will be set to NULL on user deletion).
ALTER TABLE public.dsar_requests
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Re-add the FK with ON DELETE SET NULL instead of CASCADE.
ALTER TABLE public.dsar_requests
  ADD CONSTRAINT dsar_requests_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Step 5: Useful index for the audit column so post-deletion lookups remain fast.
CREATE INDEX IF NOT EXISTS idx_dsar_requests_deleted_user_id
  ON public.dsar_requests (deleted_user_id)
  WHERE deleted_user_id IS NOT NULL;

-- RLS note: existing policies that filter on user_id = auth.uid() continue to
-- work correctly for active users.  Rows where user_id IS NULL (deleted accounts)
-- are invisible to regular authenticated users and accessible only to service_role,
-- which is the correct behaviour for a completed erasure audit record.
