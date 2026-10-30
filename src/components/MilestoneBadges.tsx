import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Trophy, Star, Waves, Target, Calendar, MapPin, TrendingUp, Share2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface Milestone {
  id: string;
  badge_type: string;
  badge_name: string;
  description: string | null;
  earned_at: string;
  metadata: Json | null;
}

const MilestoneBadges: React.FC = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching milestones:', error);
    } else {
      setMilestones(data || []);
    }
  }, [user]);

  useEffect(() => {
    void fetchMilestones();
  }, [fetchMilestones]);

  const handleShare = async (milestone: Milestone) => {
    const shareText = `🏆 I just earned the "${milestone.badge_name}" badge! ${milestone.description}`;
    const shareUrl = window.location.origin;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Achievement Unlocked!',
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: 'Shared successfully!',
          description: 'Your achievement has been shared.',
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopiedId(milestone.id);
        toast({
          title: 'Copied to clipboard!',
          description: 'Share your achievement anywhere.',
        });
        setTimeout(() => setCopiedId(null), 2000);
      } catch (error) {
        console.error('Copy error:', error);
        toast({
          title: 'Could not copy',
          description: 'Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'first_session': return <Waves className="h-6 w-6" />;
      case 'skill_advancement': return <TrendingUp className="h-6 w-6" />;
      case 'session_streak': return <Calendar className="h-6 w-6" />;
      case 'spot_explorer': return <MapPin className="h-6 w-6" />;
      case 'goal_achiever': return <Target className="h-6 w-6" />;
      case 'dedication': return <Trophy className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'first_session': return 'from-blue-500 to-cyan-500';
      case 'skill_advancement': return 'from-purple-500 to-pink-500';
      case 'session_streak': return 'from-orange-500 to-red-500';
      case 'spot_explorer': return 'from-green-500 to-emerald-500';
      case 'goal_achiever': return 'from-yellow-500 to-amber-500';
      case 'dedication': return 'from-indigo-500 to-violet-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  // Available milestones (not yet earned)
  const allPossibleMilestones = [
    { type: 'first_session', name: 'First Wave', description: 'Complete your first surf session' },
    { type: 'skill_advancement', name: 'Level Up', description: 'Advance to the next skill level' },
    { type: 'session_streak', name: 'Consistent Surfer', description: 'Surf 7 days in a row' },
    { type: 'spot_explorer', name: 'Spot Explorer', description: 'Surf at 5 different spots' },
    { type: 'goal_achiever', name: 'Goal Crusher', description: 'Complete 3 goals' },
    { type: 'dedication', name: 'Dedicated', description: 'Complete 50 surf sessions' }
  ];

  const earnedTypes = new Set(milestones.map(m => m.badge_type));
  const unearnedMilestones = allPossibleMilestones.filter(m => !earnedTypes.has(m.type));

  return (
    <Card className="shadow-float">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-warning" />
          Achievement Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Earned Badges */}
        {milestones.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Earned Badges ({milestones.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="relative group"
                >
                  <div className={`p-4 rounded-lg bg-gradient-to-br ${getBadgeColor(milestone.badge_type)} text-white shadow-lg transform transition-transform hover:scale-105`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2">
                        {getBadgeIcon(milestone.badge_type)}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{milestone.badge_name}</h4>
                      {milestone.description && (
                        <p className="text-xs opacity-90 line-clamp-2">{milestone.description}</p>
                      )}
                      <p className="text-xs mt-2 opacity-75">
                        {format(new Date(milestone.earned_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 bg-white/20 hover:bg-white/30"
                      onClick={() => handleShare(milestone)}
                    >
                      {copiedId === milestone.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Share2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unearned Badges */}
        {unearnedMilestones.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Available Badges ({unearnedMilestones.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {unearnedMilestones.map((milestone) => (
                <div
                  key={milestone.type}
                  className="relative"
                >
                  <div className="p-4 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 opacity-60">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-2 text-muted-foreground">
                        {getBadgeIcon(milestone.type)}
                      </div>
                      <h4 className="font-semibold text-sm mb-1 text-muted-foreground">
                        {milestone.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl opacity-20">🔒</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {milestones.length === 0 && (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              No badges earned yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start surfing and completing goals to earn achievement badges!
            </p>
          </div>
        )}

        {/* Motivational Footer */}
        {milestones.length > 0 && unearnedMilestones.length > 0 && (
          <div className="mt-6 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-sm text-center">
              <strong>Keep it up!</strong> You have {unearnedMilestones.length} more badge{unearnedMilestones.length > 1 ? 's' : ''} to unlock! 🏆
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MilestoneBadges;
