import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, MapPin, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  title: string;
  description: string;
  spot_preferences: any;
  created_at: string;
  updated_at: string;
}

const LogsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSessions(data);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              Session Logs
            </h1>
            <p className="text-muted-foreground">
              Track your surf planning sessions and preferences
            </p>
          </div>
          <Button asChild>
            <a href="/plan">New Session</a>
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Waves className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start planning your first surf session to see it here
              </p>
              <Button asChild>
                <a href="/plan">Plan Your First Session</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-float transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">{session.title}</CardTitle>
                      {session.description && (
                        <p className="text-sm text-muted-foreground">
                          {session.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {new Date(session.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(session.created_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
