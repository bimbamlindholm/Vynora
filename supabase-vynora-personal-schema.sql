-- =========================================================================
-- VYNORA - STANDALONE PERSONAL DTR & PRODUCTIVITY PORTAL
-- DATABASE SETUP SCHEMA & POLICIES
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

-- 2. CREATE ATTENDANCE RECORDS TABLE (INDIVIDUAL DTR)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  total_hours NUMERIC,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  latitude NUMERIC(9,6) DEFAULT NULL,
  longitude NUMERIC(9,6) DEFAULT NULL,
  verification_photo TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- 4. CREATE SECURITY POLICIES FOR PROFILES
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

-- 5. CREATE SECURITY POLICIES FOR ATTENDANCE RECORDS (INDIVIDUAL DTR)
DROP POLICY IF EXISTS "Allow users to manage own attendance" ON public.attendance_records;
CREATE POLICY "Allow users to manage own attendance" ON public.attendance_records
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. AUTOMATED TRIGGER FOR SIGN-UPS (Google, Facebook, Email, etc.)
-- This automatically initializes a profile in the public schema when a new user registers.
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
