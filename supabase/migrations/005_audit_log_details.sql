-- ==============================================================================
-- 005: Audit log details
-- ------------------------------------------------------------------------------
-- The admin signs in through a server-issued session, so record the admin's
-- email alongside (or instead of) the auth user id, and make the log fast to
-- page through newest-first. Rows are written by the server (service role)
-- and readable only by admins (policy from 001).
-- ==============================================================================

ALTER TABLE public.admin_audit_logs
  ADD COLUMN IF NOT EXISTS admin_email TEXT;

CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
  ON public.admin_audit_logs (created_at DESC);

-- Audit entries are append-only: nobody (not even admins via the API) may edit or delete them.
DROP POLICY IF EXISTS "Admins manage audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins read audit logs" ON public.admin_audit_logs
    FOR SELECT USING (public.is_admin());
