-- Properly hide cnpj and whatsapp by revoking table-level SELECT and re-granting only safe columns.
REVOKE SELECT ON public.companies FROM authenticated, anon;
GRANT SELECT (id, user_id, company_name, description, logo_url, website, city, state, verified, created_at, updated_at)
  ON public.companies TO authenticated, anon;