-- Remove public leaderboard view entirely

REVOKE SELECT ON public.leaderboard_stats FROM anon, authenticated;
DROP VIEW IF EXISTS public.leaderboard_stats;
