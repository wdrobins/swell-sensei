import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SkillRecord {
  id: string;
  skill_level: string;
  recorded_at: string;
  notes: string | null;
}

const SkillProgressionChart: React.FC = () => {
  const { user } = useAuth();
  const [skillHistory, setSkillHistory] = useState<SkillRecord[]>([]);
  const [currentSkillLevel, setCurrentSkillLevel] = useState<string | null>(null);

  useEffect(() => {
    fetchSkillHistory();
    fetchCurrentSkillLevel();
  }, [user]);

  const fetchSkillHistory = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('skill_history')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching skill history:', error);
    } else {
      setSkillHistory(data || []);
    }
  };

  const fetchCurrentSkillLevel = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('skill_level')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching current skill level:', error);
    } else {
      setCurrentSkillLevel(data?.skill_level || null);
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-secondary';
      case 'intermediate': return 'bg-warning';
      case 'advanced': return 'bg-accent';
      case 'expert': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getSkillLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner': return 'secondary';
      case 'intermediate': return 'warning';
      case 'advanced': return 'accent';
      case 'expert': return 'success';
      default: return 'secondary';
    }
  };

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const currentIndex = currentSkillLevel ? skillLevels.indexOf(currentSkillLevel) : -1;

  return (
    <Card className="shadow-float">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Skill Progression Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Level Display */}
        <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Level</p>
              {currentSkillLevel ? (
                <Badge variant={getSkillLevelBadge(currentSkillLevel) as any} className="capitalize text-base">
                  {currentSkillLevel}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not set</p>
              )}
            </div>
            {currentIndex >= 0 && currentIndex < skillLevels.length - 1 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Next Level</p>
                <Badge variant={getSkillLevelBadge(skillLevels[currentIndex + 1]) as any} className="capitalize">
                  {skillLevels[currentIndex + 1]}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {skillLevels.map((level, index) => (
              <div key={level} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                  currentIndex >= index ? getSkillLevelColor(level) : 'bg-muted'
                }`}>
                  {currentIndex >= index ? (
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs capitalize text-center">{level}</span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-secondary via-warning to-success transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / skillLevels.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Historical Timeline */}
        {skillHistory.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Progression History
            </h3>
            <div className="space-y-2">
              {skillHistory.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                >
                  <div className={`w-3 h-3 rounded-full mt-1 ${getSkillLevelColor(record.skill_level)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSkillLevelBadge(record.skill_level) as any} className="capitalize text-xs">
                        {record.skill_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.recorded_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Your skill progression history will appear here as you advance through levels
            </p>
          </div>
        )}

        {/* Motivational Footer */}
        {currentSkillLevel && currentIndex < skillLevels.length - 1 && (
          <div className="mt-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-center">
              <strong>Keep going!</strong> You are on your way to becoming {
                currentIndex === 0 ? 'an intermediate' :
                currentIndex === 1 ? 'an advanced' :
                'an expert'
              } surfer! 🏄‍♂️
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillProgressionChart;
