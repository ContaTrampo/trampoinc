CREATE OR REPLACE FUNCTION public.create_company_for_recruiter(p_user_id uuid, p_company_name text, p_cnpj text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: cannot create company for another user';
  END IF;

  INSERT INTO public.companies (user_id, company_name, cnpj)
  VALUES (p_user_id, p_company_name, p_cnpj);
END;
$function$;

CREATE POLICY "Users can delete own resumes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'resumes' AND (auth.uid())::text = (storage.foldername(name))[1]);