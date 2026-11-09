-- ==============================================================================
-- 004: Database-backed queue for Telegram updates
-- ------------------------------------------------------------------------------
-- The webhook now only verifies, records the update and replies to Telegram.
-- Extraction runs afterwards from this queue (in the background after the reply,
-- plus a scheduled sweep for anything left behind).
-- ==============================================================================

ALTER TABLE public.telegram_updates
  ADD COLUMN IF NOT EXISTS payload JSONB,                       -- the channel post as received
  ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_telegram_updates_pending
  ON public.telegram_updates (created_at)
  WHERE processing_status = 'pending';

-- Atomically lease up to `batch_size` pending updates. SKIP LOCKED lets several
-- workers run at once without picking the same update; a lease older than
-- `stale_after` is considered abandoned (e.g. the function was killed) and retried.
CREATE OR REPLACE FUNCTION public.lease_telegram_updates(
  batch_size INT DEFAULT 5,
  max_attempts INT DEFAULT 3,
  stale_after INTERVAL DEFAULT interval '5 minutes'
)
RETURNS SETOF public.telegram_updates
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.telegram_updates t
     SET locked_at = now(),
         attempts = t.attempts + 1
   WHERE t.id IN (
     SELECT id FROM public.telegram_updates
      WHERE processing_status = 'pending'
        AND payload IS NOT NULL
        AND attempts < max_attempts
        AND (locked_at IS NULL OR locked_at < now() - stale_after)
      ORDER BY created_at
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
   )
  RETURNING t.*;
END;
$$;

-- Only the server (service role) may run the queue.
REVOKE ALL ON FUNCTION public.lease_telegram_updates(INT, INT, INTERVAL) FROM PUBLIC, anon, authenticated;
