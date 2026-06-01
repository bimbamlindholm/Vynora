-- =========================================================================
-- VYNORA (TRACKLY V3) - MASTER DATABASE SCHEMA & POLICIES
-- =========================================================================
-- This script drops old tables and creates the 100% COMPLETE database schema 
-- matching every single column ever referenced by the Vynora codebase.
-- Run this in your Supabase SQL Editor (https://supabase.com).
-- =========================================================================

-- DROP EXISTING TABLES TO PREVENT CONFLICTS
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.field_errands CASCADE;
DROP TABLE IF EXISTS public.attendance_correction_requests CASCADE;
DROP TABLE IF EXISTS public.leave_requests CASCADE;
DROP TABLE IF EXISTS public.payslips CASCADE;
DROP TABLE IF EXISTS public.payroll_batches CASCADE;
DROP TABLE IF EXISTS public.employee_permissions CASCADE;
DROP TABLE IF EXISTS public.schedules CASCADE;
DROP TABLE IF EXISTS public.attendance_records CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. CREATE MASTER USER PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT DEFAULT '',
  email TEXT NOT NULL,
  role TEXT DEFAULT 'personal',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  department TEXT DEFAULT '',
  position TEXT DEFAULT '',
  employee_id TEXT DEFAULT '',
  sss TEXT DEFAULT '',
  philhealth TEXT DEFAULT '',
  pagibig TEXT DEFAULT '',
  tin TEXT DEFAULT '',
  face_photo TEXT DEFAULT '',
  hourly_rate NUMERIC DEFAULT 0,
  daily_rate NUMERIC DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE MASTER WORKSPACES TABLE
CREATE TABLE public.workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_name TEXT DEFAULT 'Personal Workspace',
  workspace_code TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  industry TEXT DEFAULT '',
  team_size TEXT DEFAULT '',
  company_address TEXT DEFAULT '',
  contact_number TEXT DEFAULT '',
  shift_start_time TEXT DEFAULT '09:00',
  expected_work_hours NUMERIC DEFAULT 8,
  late_grace_minutes INTEGER DEFAULT 0,
  default_hourly_rate NUMERIC DEFAULT 100,
  default_daily_rate NUMERIC DEFAULT 800,
  overtime_rate NUMERIC DEFAULT 1.25,
  payroll_period TEXT DEFAULT 'monthly',
  break_hours NUMERIC DEFAULT 1.0,
  break_is_paid BOOLEAN DEFAULT FALSE,
  overtime_threshold_minutes INTEGER DEFAULT 30,
  custom_deductions JSONB DEFAULT '[]'::jsonb,
  geofence_enabled BOOLEAN DEFAULT FALSE,
  geofence_latitude NUMERIC(9,6) DEFAULT NULL,
  geofence_longitude NUMERIC(9,6) DEFAULT NULL,
  geofence_radius_meters INTEGER DEFAULT 100,
  holiday_regular_rate NUMERIC DEFAULT 2.0,
  holiday_special_rate NUMERIC DEFAULT 1.3,
  night_diff_rate NUMERIC DEFAULT 0.10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE MASTER WORKSPACE MEMBERS TABLE
CREATE TABLE public.workspace_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'personal',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE(workspace_id, user_id)
);

-- 4. CREATE MASTER ATTENDANCE RECORDS TABLE (EVENT-BASED)
CREATE TABLE public.attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  workspace_id TEXT DEFAULT 'personal-ws',
  action TEXT NOT NULL, -- 'time_in', 'time_out', 'break_in', 'break_out'
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  comment TEXT DEFAULT '',
  latitude NUMERIC(9,6) DEFAULT NULL,
  longitude NUMERIC(9,6) DEFAULT NULL,
  verification_photo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE MASTER SCHEDULES TABLE
CREATE TABLE public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id TEXT DEFAULT 'personal-ws',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  shift_start TEXT DEFAULT '09:00',
  shift_end TEXT DEFAULT '18:00',
  label TEXT DEFAULT 'Day Shift',
  color TEXT DEFAULT '#06b6d4',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- 6. CREATE MASTER EMPLOYEE PERMISSIONS TABLE
CREATE TABLE public.employee_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE UNIQUE,
  allow_self_clock BOOLEAN DEFAULT TRUE,
  allow_edit_dtr BOOLEAN DEFAULT TRUE,
  require_face_verification BOOLEAN DEFAULT FALSE,
  require_gps BOOLEAN DEFAULT FALSE,
  face_verification BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CREATE MASTER PAYROLL BATCHES TABLE
CREATE TABLE public.payroll_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'none',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CREATE MASTER PAYSLIPS TABLE
CREATE TABLE public.payslips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID REFERENCES public.payroll_batches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed_days INTEGER DEFAULT 0,
  rows_count INTEGER DEFAULT 0,
  total_hours TEXT DEFAULT '0h 00m',
  overtime_hours TEXT DEFAULT '0h 00m',
  late_minutes INTEGER DEFAULT 0,
  undertime_hours TEXT DEFAULT '0h 00m',
  regular_pay NUMERIC DEFAULT 0,
  overtime_pay NUMERIC DEFAULT 0,
  holiday_pay NUMERIC DEFAULT 0,
  night_diff_pay NUMERIC DEFAULT 0,
  gross_pay NUMERIC DEFAULT 0,
  late_deduction NUMERIC DEFAULT 0,
  undertime_deduction NUMERIC DEFAULT 0,
  sss_deduction NUMERIC DEFAULT 0,
  philhealth_deduction NUMERIC DEFAULT 0,
  pagibig_deduction NUMERIC DEFAULT 0,
  custom_deductions JSONB DEFAULT '[]'::jsonb,
  total_deductions NUMERIC DEFAULT 0,
  net_pay NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CREATE MASTER LEAVE REQUESTS TABLE
CREATE TABLE public.leave_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type TEXT NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CREATE MASTER CORRECTIONS TABLE
CREATE TABLE public.attendance_correction_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  correct_time_in TEXT DEFAULT NULL,
  correct_time_out TEXT DEFAULT NULL,
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CREATE MASTER FIELD ERRANDS TABLE
CREATE TABLE public.field_errands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  purpose TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CREATE MASTER AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS CONTROL POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;

-- SECURITY POLICIES (Allows all authenticated actions for personal user privacy)
CREATE POLICY "Allow users to view own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Allow users to insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Allow users to manage own attendance" ON public.attendance_records FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow users to manage own schedules" ON public.schedules FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow users to manage own leaves" ON public.leave_requests FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow users to manage own corrections" ON public.attendance_correction_requests FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow users to view own payslips" ON public.payslips FOR SELECT TO authenticated USING (user_id = auth.uid());

-- AUTOMATED TRIGGER FOR NEW SIGN-UPS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_tier, subscription_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    'personal',
    'free',
    'active'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- GRANT ALL PERMISSIONS TO ANONYMOUS/AUTHENTICATED CLIENTS
GRANT ALL ON public.profiles TO authenticated, anon;
GRANT ALL ON public.workspaces TO authenticated, anon;
GRANT ALL ON public.workspace_members TO authenticated, anon;
GRANT ALL ON public.attendance_records TO authenticated, anon;
GRANT ALL ON public.schedules TO authenticated, anon;
GRANT ALL ON public.employee_permissions TO authenticated, anon;
GRANT ALL ON public.payroll_batches TO authenticated, anon;
GRANT ALL ON public.payslips TO authenticated, anon;
GRANT ALL ON public.leave_requests TO authenticated, anon;
GRANT ALL ON public.attendance_correction_requests TO authenticated, anon;
GRANT ALL ON public.field_errands TO authenticated, anon;
GRANT ALL ON public.audit_logs TO authenticated, anon;
