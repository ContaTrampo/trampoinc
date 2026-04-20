-- 1. Wire up the privilege-escalation prevention trigger on profiles
DROP TRIGGER IF EXISTS profiles_prevent_role_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_role_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 2. Restrict sensitive columns on companies via column-level privileges.
-- RLS still allows row visibility (so joins like jobs->company_name keep working),
-- but the cnpj and whatsapp columns are no longer selectable by regular users.
REVOKE SELECT (cnpj, whatsapp) ON public.companies FROM authenticated;
REVOKE SELECT (cnpj, whatsapp) ON public.companies FROM anon;

-- 3. Provide a secure way for owners and admins to retrieve their own
-- company's private fields when needed (e.g. settings page).
CREATE OR REPLACE FUNCTION public.get_company_private(p_company_id uuid)
RETURNS TABLE (cnpj text, whatsapp text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.companies c
      WHERE c.id = p_company_id AND c.user_id = auth.uid()
    )
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT c.cnpj, c.whatsapp
  FROM public.companies c
  WHERE c.id = p_company_id;
END;
$$;