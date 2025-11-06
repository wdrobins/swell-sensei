import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Award, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  skill_level: string | null;
  total_sessions: number;
  goals_completed: number;
  badges_earned: number;
  last_active: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"sessions" | "goals" | "badges">("sessions");

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          user_id,
          display_name,
          avatar_url,
          skill_level
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch additional stats for each user
      const enrichedData = await Promise.all(
        data.map(async (profile) => {
          const [sessionsRes, goalsRes, milestonesRes] = await Promise.all([
            supabase
              .from("sessions")
              .select("id, created_at", { count: "exact" })
              .eq("user_id", profile.user_id),
            supabase
              .from("goals")
              .select("id", { count: "exact" })
              .eq("user_id", profile.user_id)
              .eq("status", "completed"),
            supabase
              .from("milestones")
              .select("id", { count: "exact" })
              .eq("user_id", profile.user_id),
          ]);

          const lastSession = sessionsRes.data?.[0]?.created_at;

          return {
            ...profile,
            total_sessions: sessionsRes.count || 0,
            goals_completed: goalsRes.count || 0,
            badges_earned: milestonesRes.count || 0,
            last_active: lastSession || profile.user_id,
          };
        })
      );

      // Sort based on selected criteria
      const sorted = enrichedData.sort((a, b) => {
        if (sortBy === "sessions") return b.total_sessions - a.total_sessions;
        if (sortBy === "goals") return b.goals_completed - a.goals_completed;
        return b.badges_earned - a.badges_earned;
      });

      setLeaderboard(sorted);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Trophy className="h-5 w-5 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">
          See how you rank against other surfers
        </p>
      </div>

      <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Badges
          </TabsTrigger>
        </TabsList>

        <TabsContent value={sortBy} className="space-y-4 mt-6">
          {leaderboard.map((entry, index) => (
            <Card
              key={entry.user_id}
              className={`transition-all ${
                entry.user_id === user?.id
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 text-center font-bold text-lg">
                      {getRankIcon(index) || `#${index + 1}`}
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={entry.avatar_url || undefined} />
                      <AvatarFallback>
                        {entry.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {entry.display_name || "Anonymous Surfer"}
                        </h3>
                        {entry.user_id === user?.id && (
                          <Badge variant="secondary">You</Badge>
                        )}
                      </div>
                      {entry.skill_level && (
                        <Badge variant="outline" className="capitalize mt-1">
                          {entry.skill_level}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {entry.total_sessions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Sessions
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {entry.goals_completed}
                      </div>
                      <div className="text-xs text-muted-foreground">Goals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {entry.badges_earned}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Badges
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {leaderboard.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No surfers on the leaderboard yet. Be the first!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
