-- Create a public view for leaderboard stats (aggregated user stats)
CREATE OR REPLACE VIEW public.leaderboard_stats AS
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

-- Enable RLS on the view (views inherit RLS from underlying tables, but we make it explicit)
-- Everyone can view the leaderboard
CREATE POLICY "Leaderboard is viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Add index for better leaderboard query performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON public.sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_milestones_user_earned ON public.milestones(user_id, earned_at DESC);