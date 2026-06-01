-- =========================================================================
-- VYNORA - STANDALONE PERSONAL DTR & PRODUCTIVITY PORTAL
-- DATABASE SETUP SCHEMA & POLICIES (CORRECTED EVENT-BASED SCHEMA)
-- =========================================================================
-- Run this full script in your Supabase SQL Editor (https://supabase.com)
-- This sets up the minimal, clean schema needed strictly for the
-- standalone Personal Account DTR and estimated pay calculation engine.
-- =========================================================================

-- 1. CREATE USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT NOT NULL,
  hourly_rate NUMERIC DEFAULT 0,
  daily_rate NUMERIC DEFAULT 0,
  face_photo TEXT DEFAULT '',
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE ATTENDANCE RECORDS TABLE (EVENT-BASED TRANSACTIONAL LOGS)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id TEXT DEFAULT 'personal-ws',
  action TEXT NOT NULL, -- 'time_in', 'time_out', 'break_in', 'break_out'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- The exact time of the clock event
  date DATE NOT NULL DEFAULT CURRENT_DATE, -- The day of the event
  comment TEXT DEFAULT '',
  latitude NUMERIC(9,6) DEFAULT NULL,
  longitude NUMERIC(9,6) DEFAULT NULL,
  verification_photo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE SCHEDULES TABLE (INDIVIDUAL CALENDAR PRESENTS)
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id TEXT DEFAULT 'personal-ws',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  shift_start TEXT DEFAULT '09:00',
  shift_end TEXT DEFAULT '18:00',
  label TEXT DEFAULT 'Day Shift',
  color TEXT DEFAULT '#06b6d4',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 5. CREATE SECURITY POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
CREATE POLICY "Allow users to view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;
CREATE POLICY "Allow users to insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 6. CREATE SECURITY POLICIES FOR ATTENDANCE RECORDS (INDIVIDUAL DTR)
DROP POLICY IF EXISTS "Allow users to manage own attendance" ON public.attendance_records;
CREATE POLICY "Allow users to manage own attendance" ON public.attendance_records
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. CREATE SECURITY POLICIES FOR SCHEDULES
DROP POLICY IF EXISTS "Allow users to manage own schedules" ON public.schedules;
CREATE POLICY "Allow users to manage own schedules" ON public.schedules
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 8. AUTOMATED TRIGGER FOR SIGN-UPS (Google, Facebook, Email, etc.)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, hourly_rate, daily_rate, subscription_tier, subscription_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    0,
    0,
    'free',
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions to public roles
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT ALL ON public.attendance_records TO authenticated, anon;
GRANT ALL ON public.schedules TO authenticated, anon;
