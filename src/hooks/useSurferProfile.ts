import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isProfileComplete, toSurferProfile, type StoredProfile } from '@/lib/profileAdapter';

export function useSurferProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['surfer-profile', user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<StoredProfile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, skill_level, experience_years, preferred_wave_size')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return {
    ...query,
    surferProfile: toSurferProfile(query.data ?? null),
    isPersonalized: isProfileComplete(query.data),
  };
}
