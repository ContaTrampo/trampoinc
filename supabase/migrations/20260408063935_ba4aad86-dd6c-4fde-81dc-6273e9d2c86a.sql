
-- YouTube links managed by admin
CREATE TABLE public.youtube_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'geral',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.youtube_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active youtube links"
ON public.youtube_links FOR SELECT
TO authenticated
USING (active = true);

CREATE POLICY "Admins can manage youtube links"
ON public.youtube_links FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'admin'));

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
ON public.testimonials FOR SELECT
USING (true);

CREATE POLICY "Admins can manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.user_type = 'admin'));

-- Fix company creation: allow the handle_new_user trigger to also create companies
-- We'll use a security definer function for company creation during signup
CREATE OR REPLACE FUNCTION public.create_company_for_recruiter(
  p_user_id UUID,
  p_company_name TEXT,
  p_cnpj TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.companies (user_id, company_name, cnpj)
  VALUES (p_user_id, p_company_name, p_cnpj);
END;
$$;
