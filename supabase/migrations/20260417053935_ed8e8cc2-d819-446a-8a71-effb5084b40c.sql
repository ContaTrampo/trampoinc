
-- Remove direct INSERT access to notifications by end-users.
-- Notifications must be created via the SECURITY DEFINER RPC create_notification,
-- which authorizes the caller (self-notify or recruiter-to-applicant).
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

-- Authorized notification creator
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT NULL,
  p_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_id uuid;
  v_allowed boolean := false;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Validate inputs (basic length limits to prevent abuse)
  IF p_title IS NULL OR length(p_title) = 0 OR length(p_title) > 200 THEN
    RAISE EXCEPTION 'Invalid title';
  END IF;
  IF p_type IS NULL OR length(p_type) > 50 THEN
    RAISE EXCEPTION 'Invalid type';
  END IF;
  IF p_message IS NOT NULL AND length(p_message) > 2000 THEN
    RAISE EXCEPTION 'Message too long';
  END IF;

  -- Allow self-notification (e.g. confirming an application sent)
  IF v_caller = p_user_id THEN
    v_allowed := true;
  -- Allow admins
  ELSIF public.has_role(v_caller, 'admin') THEN
    v_allowed := true;
  -- Allow recruiters to notify candidates who applied to their jobs
  ELSIF EXISTS (
    SELECT 1
    FROM public.applications a
    JOIN public.jobs j ON j.id = a.job_id
    JOIN public.companies c ON c.id = j.company_id
    WHERE a.user_id = p_user_id
      AND c.user_id = v_caller
  ) THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Not authorized to notify this user';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
