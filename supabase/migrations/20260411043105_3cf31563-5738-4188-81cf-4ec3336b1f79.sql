
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS whatsapp text;
