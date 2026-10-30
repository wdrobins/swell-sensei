import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Target, Award } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { getSpotId } from "@/lib/sessionUtils";

interface AnalyticsData {
  totalSessions: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  topSpots: { spot_id: string; count: number }[];
  goalsCompleted: number;
  goalsActive: number;
  badgesEarned: number;
  recentActivity: { date: string; count: number }[];
  skillProgression: { skill_level: string; recorded_at: string }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);

      // Fetch sessions
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch goals
      const { data: goals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id);

      // Fetch milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("user_id", user.id);

      // Fetch skill history
      const { data: skillHistory } = await supabase
        .from("skill_history")
        .select("*")
        .eq("user_id", user.id)
        .order("recorded_at", { ascending: true });

      // Calculate analytics
      const sessionsThisWeek = sessions?.filter(
        (s) => new Date(s.created_at) >= weekAgo
      ).length || 0;
      
      const sessionsThisMonth = sessions?.filter(
        (s) => new Date(s.created_at) >= monthAgo
      ).length || 0;

      // Top spots analysis
      const spotCounts: Record<string, number> = {};
      sessions?.forEach((session) => {
        const spotId = getSpotId(session.spot_preferences);
        if (spotId) {
          spotCounts[spotId] = (spotCounts[spotId] || 0) + 1;
        }
      });

      const topSpots = Object.entries(spotCounts)
        .map(([spot_id, count]) => ({ spot_id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity (last 7 days)
      const activityMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(now, i), "MMM dd");
        activityMap[date] = 0;
      }
      sessions?.forEach((session) => {
        const sessionDate = format(new Date(session.created_at), "MMM dd");
        if (Object.prototype.hasOwnProperty.call(activityMap, sessionDate)) {
          activityMap[sessionDate]++;
        }
      });

      const recentActivity = Object.entries(activityMap).map(([date, count]) => ({
        date,
        count,
      }));

      setAnalytics({
        totalSessions: sessions?.length || 0,
        sessionsThisWeek,
        sessionsThisMonth,
        topSpots,
        goalsCompleted: goals?.filter((g) => g.status === "completed").length || 0,
        goalsActive: goals?.filter((g) => g.status === "active").length || 0,
        badgesEarned: milestones?.length || 0,
        recentActivity,
        skillProgression: skillHistory?.map((sh) => ({
          skill_level: sh.skill_level,
          recorded_at: sh.recorded_at,
        })) || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchAnalytics();
    }
  }, [fetchAnalytics, user]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track your surfing patterns and progression insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.sessionsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.goalsActive}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.goalsCompleted} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.badgesEarned}</div>
            <p className="text-xs text-muted-foreground">
              Keep progressing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.sessionsThisMonth}</div>
            <p className="text-xs text-muted-foreground">Sessions logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your sessions over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentActivity.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-16 text-sm text-muted-foreground">{day.date}</div>
                <Progress value={(day.count / Math.max(...analytics.recentActivity.map(d => d.count), 1)) * 100} className="flex-1" />
                <div className="w-8 text-sm font-medium">{day.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Spots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Performing Spots
          </CardTitle>
          <CardDescription>Your most visited surf spots</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topSpots.length > 0 ? (
            <div className="space-y-4">
              {analytics.topSpots.map((spot, index) => (
                <div key={spot.spot_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <span className="font-medium">{spot.spot_id}</span>
                  </div>
                  <span className="text-muted-foreground">{spot.count} sessions</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No sessions logged yet. Start surfing to see your top spots!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Skill Progression Timeline */}
      {analytics.skillProgression.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Progression Timeline</CardTitle>
            <CardDescription>Your journey through skill levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.skillProgression.map((record, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Badge className="capitalize">{record.skill_level}</Badge>
                  <div className="flex-1 border-t-2 border-dashed"></div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(record.recorded_at), "MMM dd, yyyy")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
