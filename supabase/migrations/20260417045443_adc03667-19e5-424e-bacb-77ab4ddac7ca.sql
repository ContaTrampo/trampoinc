-- 1. Create app_role enum + user_roles table for safe role checks
CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter', 'candidate');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Backfill admin role from existing profiles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role FROM public.profiles WHERE user_type = 'admin'
ON CONFLICT DO NOTHING;

-- 4. RLS for user_roles: users can read their own; only admins manage
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Lock down profiles SELECT
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Prevent privilege escalation: users cannot change user_type or plan
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_type IS DISTINCT FROM OLD.user_type
     OR NEW.plan IS DISTINCT FROM OLD.plan THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Not authorized to change user_type or plan';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_escalation();

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 7. Safe view for cross-user lookups (e.g. recruiters viewing candidates) without CPF
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT id, user_id, name, user_type, created_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO authenticated;