
-- Profiles table (auto-created on signup)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Babies table
CREATE TABLE public.babies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own babies" ON public.babies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own babies" ON public.babies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own babies" ON public.babies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own babies" ON public.babies FOR DELETE USING (auth.uid() = user_id);

-- Songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own songs" ON public.songs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = songs.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can insert own songs" ON public.songs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = songs.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can delete own songs" ON public.songs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = songs.baby_id AND babies.user_id = auth.uid()));

-- Stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pdf_url TEXT,
  cover_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stories" ON public.stories FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = stories.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can insert own stories" ON public.stories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = stories.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can delete own stories" ON public.stories FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = stories.baby_id AND babies.user_id = auth.uid()));

-- Learning sessions table
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.learning_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = learning_sessions.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can insert own sessions" ON public.learning_sessions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = learning_sessions.baby_id AND babies.user_id = auth.uid()));

-- Parenting guides table
CREATE TABLE public.parenting_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  guide_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parenting_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guides" ON public.parenting_guides FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = parenting_guides.baby_id AND babies.user_id = auth.uid()));
CREATE POLICY "Users can insert own guides" ON public.parenting_guides FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = parenting_guides.baby_id AND babies.user_id = auth.uid()));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_babies_updated_at BEFORE UPDATE ON public.babies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
