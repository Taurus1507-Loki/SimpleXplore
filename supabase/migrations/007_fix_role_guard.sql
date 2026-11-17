-- ==============================================================================
-- 007: Fix the role-escalation guard from 002
-- ------------------------------------------------------------------------------
-- 002's trigger only allowed role changes when auth.role() = 'service_role'.
-- The Supabase SQL Editor (database owner) sends no JWT, so auth.role() is
-- empty and the owner could not grant the admin role either.
--
-- The guard is now SECURITY INVOKER and checks the Postgres role actually
-- running the UPDATE:
--   * 'anon' / 'authenticated'  = requests from website visitors via the API
--     -> role changes blocked unless the caller is already an admin
--   * postgres (SQL Editor), service_role (server), supabase_admin
--     -> allowed
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND current_user IN ('anon', 'authenticated')
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Changing profile role is not permitted';
  END IF;
  RETURN NEW;
END;
$$;
