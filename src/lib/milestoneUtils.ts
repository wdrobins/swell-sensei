import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface MilestoneSession {
  created_at: string;
  spot_preferences?: { selectedSpots?: string[] } | null;
}

interface MilestoneGoal {
  status: string;
}

export interface MilestoneCheck {
  userId: string;
  sessions?: MilestoneSession[];
  goals?: MilestoneGoal[];
}

/**
 * Check and award milestones based on user activity
 */
export const checkAndAwardMilestones = async ({ userId, sessions, goals }: MilestoneCheck) => {
  const milestones = [];

  try {
    // Fetch existing milestones to avoid duplicates
    const { data: existingMilestones } = await supabase
      .from('milestones')
      .select('badge_type')
      .eq('user_id', userId);

    const earnedTypes = new Set(existingMilestones?.map(m => m.badge_type) || []);

    // Check for first session milestone
    if (!earnedTypes.has('first_session') && sessions && sessions.length >= 1) {
      milestones.push({
        user_id: userId,
        badge_type: 'first_session',
        badge_name: 'First Wave',
        description: 'Completed your first surf session!',
        metadata: { session_count: sessions.length }
      });
    }

    // Check for session streak milestone (needs to check dates)
    if (!earnedTypes.has('session_streak') && sessions && sessions.length >= 7) {
      // This is simplified - in reality, you'd check for consecutive days
      const recentSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate >= weekAgo;
      });

      if (recentSessions.length >= 7) {
        milestones.push({
          user_id: userId,
          badge_type: 'session_streak',
          badge_name: 'Consistent Surfer',
          description: 'Surfed 7 days in a row!',
          metadata: { streak_days: 7 }
        });
      }
    }

    // Check for spot explorer milestone
    if (!earnedTypes.has('spot_explorer') && sessions && sessions.length > 0) {
      const uniqueSpots = new Set(
        sessions.flatMap((s) => s.spot_preferences?.selectedSpots || [])
      );

      if (uniqueSpots.size >= 5) {
        milestones.push({
          user_id: userId,
          badge_type: 'spot_explorer',
          badge_name: 'Spot Explorer',
          description: 'Surfed at 5 different spots!',
          metadata: { spots: Array.from(uniqueSpots) }
        });
      }
    }

    // Check for goal achiever milestone
    if (!earnedTypes.has('goal_achiever') && goals) {
      const completedGoals = goals.filter((g) => g.status === 'completed');
      
      if (completedGoals.length >= 3) {
        milestones.push({
          user_id: userId,
          badge_type: 'goal_achiever',
          badge_name: 'Goal Crusher',
          description: 'Completed 3 goals!',
          metadata: { goals_completed: completedGoals.length }
        });
      }
    }

    // Check for dedication milestone
    if (!earnedTypes.has('dedication') && sessions && sessions.length >= 50) {
      milestones.push({
        user_id: userId,
        badge_type: 'dedication',
        badge_name: 'Dedicated Surfer',
        description: 'Completed 50 surf sessions!',
        metadata: { session_count: sessions.length }
      });
    }

    // Award all new milestones
    if (milestones.length > 0) {
      const { error } = await supabase
        .from('milestones')
        .insert(milestones);

      if (error) {
        console.error('Error awarding milestones:', error);
      return { success: false, awarded: [] };
      }

      // Show toast notifications for newly awarded milestones
      milestones.forEach(milestone => {
        toast({
          title: '🏆 New Badge Earned!',
          description: `${milestone.badge_name}: ${milestone.description}`,
          duration: 5000,
        });
      });

      return { success: true, awarded: milestones };
    }

    return { success: true, awarded: [] };
  } catch (error) {
    console.error('Error checking milestones:', error);
    return { success: false, awarded: [] };
  }
};

/**
 * Award a specific milestone immediately
 */
export const awardMilestone = async (
  userId: string,
  badgeType: string,
  badgeName: string,
  description: string,
  metadata?: Json
) => {
  try {
    // Check if already earned
    const { data: existing } = await supabase
      .from('milestones')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_type', badgeType)
      .single();

    if (existing) {
      return { success: false, message: 'Already earned' };
    }

    const { error } = await supabase
      .from('milestones')
      .insert({
        user_id: userId,
        badge_type: badgeType,
        badge_name: badgeName,
        description,
        metadata
      });

    if (error) {
      console.error('Error awarding milestone:', error);
      return { success: false, message: error.message };
    }

    // Show toast notification for the awarded milestone
    toast({
      title: '🏆 New Badge Earned!',
      description: `${badgeName}: ${description}`,
      duration: 5000,
    });

    return { success: true, message: 'Milestone awarded!' };
  } catch (error) {
    console.error('Error awarding milestone:', error);
    return { success: false, message: 'Unknown error' };
  }
};
