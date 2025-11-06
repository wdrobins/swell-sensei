-- Drop and recreate the view with SECURITY INVOKER to fix security warning
DROP VIEW IF EXISTS public.leaderboard_stats;

CREATE OR REPLACE VIEW public.leaderboard_stats 
WITH (security_invoker = true)
AS
SELECT 
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.skill_level,
  COALESCE(session_count.count, 0) as total_sessions,
  COALESCE(goal_count.count, 0) as goals_completed,
  COALESCE(milestone_count.count, 0) as badges_earned,
  COALESCE(session_count.latest, p.created_at) as last_active
FROM public.profiles p
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(created_at) as latest
  FROM public.sessions
  GROUP BY user_id
) session_count ON p.user_id = session_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM public.goals
  WHERE status = 'completed'
  GROUP BY user_id
) goal_count ON p.user_id = goal_count.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count
  FROM public.milestones
  GROUP BY user_id
) milestone_count ON p.user_id = milestone_count.user_id;