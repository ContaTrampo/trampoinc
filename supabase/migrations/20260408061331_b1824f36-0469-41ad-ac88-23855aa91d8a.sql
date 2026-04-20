
-- Create enums
CREATE TYPE public.user_type AS ENUM ('candidate', 'recruiter', 'admin');
CREATE TYPE public.user_plan AS ENUM ('free', 'premium');
CREATE TYPE public.job_status AS ENUM ('active', 'paused', 'closed');
CREATE TYPE public.work_type AS ENUM ('remote', 'hybrid', 'onsite');
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'internship', 'temporary');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'interview', 'hired', 'rejected');
CREATE TYPE public.question_category AS ENUM ('technical', 'behavioral', 'experience', 'education', 'career_goals');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf TEXT UNIQUE,
  user_type public.user_type NOT NULL DEFAULT 'candidate',
  plan public.user_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate profiles
CREATE TABLE public.candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  birth_date DATE,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  education_level TEXT,
  institution TEXT,
  course TEXT,
  graduation_year INTEGER,
  professional_summary TEXT,
  skills TEXT,
  languages TEXT,
  desired_position TEXT,
  salary_expectation NUMERIC,
  resume_file_url TEXT,
  parsed_resume_data JSONB,
  profile_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  city TEXT,
  state TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  responsibilities TEXT,
  requirements TEXT,
  qualifications TEXT,
  min_education TEXT,
  min_experience_years INTEGER DEFAULT 0,
  salary_min NUMERIC,
  salary_max NUMERIC,
  benefits TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  work_type public.work_type NOT NULL DEFAULT 'onsite',
  job_type public.job_type NOT NULL DEFAULT 'full_time',
  status public.job_status NOT NULL DEFAULT 'active',
  requirements_vector JSONB,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category public.question_category NOT NULL,
  difficulty INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Question options
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  weight_vector JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidate answers
CREATE TABLE public.candidate_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.question_options(id) ON DELETE CASCADE NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Candidate profile vectors
CREATE TABLE public.candidate_profile_vectors (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vector JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  status public.application_status NOT NULL DEFAULT 'pending',
  match_score NUMERIC DEFAULT 0,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Daily applications tracking
CREATE TABLE public.daily_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, application_date)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  message TEXT,
  read_at TIMESTAMPTZ,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Saved jobs
CREATE TABLE public.saved_jobs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profile_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Candidate profiles policies
CREATE POLICY "Users can view own candidate profile" ON public.candidate_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can view candidate profiles" ON public.candidate_profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.user_id = auth.uid() AND profiles.user_type IN ('recruiter', 'admin'))
);
CREATE POLICY "Users can insert own candidate profile" ON public.candidate_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own candidate profile" ON public.candidate_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Companies policies
CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Recruiters can insert own company" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recruiters can update own company" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Company owners can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Company owners can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);
CREATE POLICY "Company owners can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.companies WHERE companies.id = company_id AND companies.user_id = auth.uid())
);

-- Questions policies (read-only for all authenticated)
CREATE POLICY "Anyone can view active questions" ON public.questions FOR SELECT TO authenticated USING (active = true);

-- Question options policies
CREATE POLICY "Anyone can view question options" ON public.question_options FOR SELECT TO authenticated USING (true);

-- Candidate answers policies
CREATE POLICY "Users can view own answers" ON public.candidate_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own answers" ON public.candidate_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON public.candidate_answers FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON public.candidate_answers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Candidate profile vectors policies
CREATE POLICY "Users can view own vector" ON public.candidate_profile_vectors FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own vector" ON public.candidate_profile_vectors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vector" ON public.candidate_profile_vectors FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON c.id = j.company_id
    WHERE j.id = job_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recruiters can update applications for their jobs" ON public.applications FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON c.id = j.company_id
    WHERE j.id = job_id AND c.user_id = auth.uid()
  )
);

-- Daily applications policies
CREATE POLICY "Users can view own daily apps" ON public.daily_applications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily apps" ON public.daily_applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily apps" ON public.daily_applications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Saved jobs policies
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save jobs" ON public.saved_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave jobs" ON public.saved_jobs FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON public.candidate_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'candidate')
  );
  
  IF COALESCE((NEW.raw_user_meta_data->>'user_type')::public.user_type, 'candidate') = 'candidate' THEN
    INSERT INTO public.candidate_profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

CREATE POLICY "Users can upload own resume" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own resume" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own resume" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
