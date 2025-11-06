-- Add surfing ability fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skill_level text CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS preferred_wave_size text,
ADD COLUMN IF NOT EXISTS experience_years integer;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.skill_level IS 'User surfing skill level: beginner, intermediate, advanced, or expert';
COMMENT ON COLUMN public.profiles.preferred_wave_size IS 'Preferred wave size range (e.g., 2-4ft)';
COMMENT ON COLUMN public.profiles.experience_years IS 'Years of surfing experience';