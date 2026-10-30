import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Check, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { checkAndAwardMilestones } from '@/lib/milestoneUtils';

interface Goal {
  id: string;
  goal_type: string;
  target_value: string;
  current_progress: number;
  target_progress: number;
  status: string;
  created_at: string;
}

const GoalsTracker: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_type: '',
    target_value: '',
    target_progress: 10
  });

  const fetchGoals = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
  }, [user]);

  useEffect(() => {
    void fetchGoals();
  }, [fetchGoals]);

  const handleCreateGoal = async () => {
    if (!user || !newGoal.goal_type || !newGoal.target_value) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        goal_type: newGoal.goal_type,
        target_value: newGoal.target_value,
        target_progress: newGoal.target_progress,
        current_progress: 0,
        status: 'active'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Goal created!",
        description: "Your new goal has been added"
      });
      setIsDialogOpen(false);
      setNewGoal({ goal_type: '', target_value: '', target_progress: 10 });
      fetchGoals();
    }

    setIsLoading(false);
  };

  const handleUpdateProgress = async (goalId: string, newProgress: number, targetProgress: number) => {
    const status = newProgress >= targetProgress ? 'completed' : 'active';
    
    const { error } = await supabase
      .from('goals')
      .update({
        current_progress: newProgress,
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    } else {
      if (status === 'completed') {
        toast({
          title: "🎉 Goal completed!",
          description: "Congratulations on achieving your goal!"
        });

        // Check for goal achievement milestones
        const { data: allGoals } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user!.id);

        if (allGoals) {
          const result = await checkAndAwardMilestones({
            userId: user!.id,
            goals: allGoals
          });

          if (result.awarded && result.awarded.length > 0) {
            setTimeout(() => {
              toast({
                title: "🏆 New Badge Earned!",
                description: `You earned: ${result.awarded.map(m => m.badge_name).join(', ')}`,
              });
            }, 1000);
          }
        }
      }
      fetchGoals();
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed"
      });
      fetchGoals();
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <Card className="shadow-float">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-success" />
            Skill Improvement Goals
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a goal to track your surfing progression
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select
                    value={newGoal.goal_type}
                    onValueChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sessions">Complete Sessions</SelectItem>
                      <SelectItem value="skill_level">Advance Skill Level</SelectItem>
                      <SelectItem value="spots">Surf New Spots</SelectItem>
                      <SelectItem value="conditions">Handle Bigger Waves</SelectItem>
                      <SelectItem value="technique">Master Technique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="e.g., Reach intermediate level"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Count</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newGoal.target_progress}
                    onChange={(e) => setNewGoal({ ...newGoal, target_progress: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Button onClick={handleCreateGoal} disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No goals yet. Create your first goal to start tracking your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Active Goals ({activeGoals.length})
                </h3>
                {activeGoals.map((goal) => {
                  const progressPercent = (goal.current_progress / goal.target_progress) * 100;
                  return (
                    <div key={goal.id} className="p-4 rounded-lg border bg-background">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <Badge variant="secondary" className="mb-2 capitalize">
                            {goal.goal_type.replace('_', ' ')}
                          </Badge>
                          <p className="font-medium">{goal.target_value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold">
                            {goal.current_progress} / {goal.target_progress}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateProgress(
                              goal.id,
                              Math.max(0, goal.current_progress - 1),
                              goal.target_progress
                            )}
                            disabled={goal.current_progress === 0}
                          >
                            -1
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleUpdateProgress(
                              goal.id,
                              goal.current_progress + 1,
                              goal.target_progress
                            )}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Log Progress
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Completed Goals ({completedGoals.length})
                </h3>
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="p-4 rounded-lg border bg-success/5 border-success/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-success/20">
                          <Check className="h-4 w-4 text-success" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-1 capitalize text-xs">
                            {goal.goal_type.replace('_', ' ')}
                          </Badge>
                          <p className="font-medium text-sm">{goal.target_value}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsTracker;
