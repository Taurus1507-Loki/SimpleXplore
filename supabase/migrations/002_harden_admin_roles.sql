-- ==============================================================================
-- 002: Harden admin role assignment
-- ------------------------------------------------------------------------------
-- Fixes two privilege-escalation paths in 001:
--   1. "Users can update their own profile" let any customer run
--      `update profiles set role = 'admin' where id = auth.uid()`.
--   2. handle_new_user() granted admin to hard-coded emails at sign-up, so
--      anyone able to register one of those addresses became admin.
--
-- After this migration, the admin role can only be granted by the service
-- role (SQL editor / server), e.g.:
--   update public.profiles set role = 'admin' where email = '<your-admin-email>';
-- ==============================================================================

-- 1. Customers may edit their own profile, but never their role.
CREATE OR REPLACE FUNCTION public.prevent_role_self_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Changing profile role is not permitted';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_escalation();

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Profiles contain emails: stop exposing every profile publicly.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile; admin can view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- 2. New sign-ups are always customers.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'customer'
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Pin search_path on the SECURITY DEFINER helper.
ALTER FUNCTION public.is_admin() SET search_path = public;
