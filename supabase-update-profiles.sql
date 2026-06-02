-- =========================================================================
-- VYNORA (TRACKLY V3) - PROFILE SCHEMA UPDATES
-- =========================================================================
-- Run this in your Supabase SQL Editor (https://supabase.com) to add 
-- premium personal profile fields to the profiles table.
-- =========================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Philippines';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profession_category TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_arrangement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS career_goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skill_focus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_working_days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_productivity_goal NUMERIC DEFAULT 40;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
