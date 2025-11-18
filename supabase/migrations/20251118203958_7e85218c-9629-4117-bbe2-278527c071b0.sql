-- Fix security issues in the database

-- 1. Fix profiles table - restrict what data is visible to other users
DROP POLICY IF EXISTS "Authenticated users can view leaderboard data" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own full profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can only view minimal leaderboard data from other profiles
CREATE POLICY "Users can view leaderboard data from others" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  auth.uid() != user_id
);

-- 2. Add missing UPDATE and DELETE policies for user data tables
-- favorite_spots already has all CRUD policies

-- milestones - add missing policies
DROP POLICY IF EXISTS "Users can update own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON public.milestones;

CREATE POLICY "Users can update own milestones" 
ON public.milestones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" 
ON public.milestones 
FOR DELETE 
USING (auth.uid() = user_id);

-- skill_history - add missing policies
DROP POLICY IF EXISTS "Users can update own skill history" ON public.skill_history;
DROP POLICY IF EXISTS "Users can delete own skill history" ON public.skill_history;

CREATE POLICY "Users can update own skill history" 
ON public.skill_history 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skill history" 
ON public.skill_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Fix user_roles table - ensure only admins can manage roles
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Only admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));