-- CryptoForge — User Progress Schema
-- Run this in Supabase SQL Editor to create the tables

-- User profiles with XP and level tracking
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak_days INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which algorithms a user has used/mastered
CREATE TABLE IF NOT EXISTS public.user_algorithm_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  algorithm_id TEXT NOT NULL,
  algorithm_name TEXT NOT NULL,
  category TEXT NOT NULL,
  run_count INTEGER DEFAULT 1,
  first_run_at TIMESTAMPTZ DEFAULT NOW(),
  last_run_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, algorithm_id)
);

-- Track challenge completions
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Track pipeline saves
CREATE TABLE IF NOT EXISTS public.user_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_name TEXT DEFAULT 'Untitled Pipeline',
  steps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_algorithm_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_pipelines ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own data
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own algorithm runs"
  ON public.user_algorithm_runs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own algorithm runs"
  ON public.user_algorithm_runs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own algorithm runs"
  ON public.user_algorithm_runs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges"
  ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own challenges"
  ON public.user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own pipelines"
  ON public.user_pipelines FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own pipelines"
  ON public.user_pipelines FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid duplicate trigger errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
