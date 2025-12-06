-- Fix leaderboard_stats view to use security invoker
-- This ensures the view respects RLS policies on underlying tables

-- Drop and recreate the view with security_invoker = true
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE VIEW public.leaderboard_stats
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.skill_level,
  (SELECT COUNT(*) FROM public.sessions s WHERE s.user_id = p.user_id) as total_sessions,
  (SELECT COUNT(*) FROM public.goals g WHERE g.user_id = p.user_id AND g.status = 'completed') as goals_completed,
  (SELECT COUNT(*) FROM public.milestones m WHERE m.user_id = p.user_id) as badges_earned,
  GREATEST(
    p.updated_at,
    (SELECT MAX(s.created_at) FROM public.sessions s WHERE s.user_id = p.user_id),
    (SELECT MAX(g.updated_at) FROM public.goals g WHERE g.user_id = p.user_id)
  ) as last_active
FROM public.profiles p;