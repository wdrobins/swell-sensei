-- Harden profiles access and provide a safe public leaderboard view

-- 1) Remove overly permissive profile SELECT policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view leaderboard data from others" ON public.profiles;

-- 2) Ensure only owners can read full profiles
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
CREATE POLICY "Users can view own full profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3) Recreate leaderboard view with limited, non-sensitive fields
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats AS
SELECT
  p.display_name,
  p.avatar_url,
  p.skill_level,
  (SELECT COUNT(*) FROM public.sessions s WHERE s.user_id = p.user_id) AS total_sessions,
  (SELECT COUNT(*) FROM public.goals g WHERE g.user_id = p.user_id AND g.status = 'completed') AS goals_completed,
  (SELECT COUNT(*) FROM public.milestones m WHERE m.user_id = p.user_id) AS badges_earned,
  GREATEST(
    p.updated_at,
    COALESCE((SELECT MAX(s.created_at) FROM public.sessions s WHERE s.user_id = p.user_id), p.updated_at),
    COALESCE((SELECT MAX(g.updated_at) FROM public.goals g WHERE g.user_id = p.user_id), p.updated_at)
  ) AS last_active
FROM public.profiles p;

-- 4) Allow public read of the leaderboard view only
GRANT SELECT ON public.leaderboard_stats TO anon, authenticated;
