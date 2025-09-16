import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Waves, TrendingUp } from 'lucide-react';

const PlanPage: React.FC = () => {
  const timeWindows = [
    { time: 'Dawn (6-8am)', spots: ['Jan Juc', 'Bells Beach'], bestScore: 85, conditions: 'Light offshore winds' },
    { time: 'Morning (8-10am)', spots: ['13th Beach', 'Jan Juc'], bestScore: 78, conditions: 'Clean conditions' },
    { time: 'Afternoon (2-4pm)', spots: ['13th Beach'], bestScore: 62, conditions: 'Onshore building' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Plan Your Session
        </h1>
        <p className="text-muted-foreground">
          Find the best surf windows based on your availability and skill level
        </p>
      </div>

      {/* Time Selector */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            When are you free to surf?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              6-8am
            </Button>
            <Button variant="default" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              8-10am
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              12-2pm
            </Button>
            <Button variant="outline" className="justify-start">
              <Clock className="h-4 w-4 mr-2" />
              2-4pm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Window Results */}
      <div className="space-y-6">
        {timeWindows.map((window, index) => (
          <Card key={index} className="shadow-float">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  {window.time}
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{window.bestScore}</div>
                  <Badge variant={
                    window.bestScore >= 80 ? 'success' :
                    window.bestScore >= 60 ? 'accent' :
                    window.bestScore >= 40 ? 'warning' : 'destructive'
                  }>
                    {window.bestScore >= 80 ? 'Safe' :
                     window.bestScore >= 60 ? 'Good' :
                     window.bestScore >= 40 ? 'Stretch' : 'No-Go'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Best Spots
                  </h4>
                  <div className="space-y-1">
                    {window.spots.map((spot, spotIndex) => (
                      <div key={spotIndex} className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{spot}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Conditions
                  </h4>
                  <div className="flex items-center gap-2">
                    <Waves className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{window.conditions}</span>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button size="sm" className="w-full">
                    Plan Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending */}
      <Card className="mt-8 shadow-float bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Week's Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">Tuesday</div>
              <div className="text-sm text-muted-foreground">Best day this week</div>
              <div className="text-xs text-muted-foreground mt-1">Clean 2-3ft SW swell</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">Thursday</div>
              <div className="text-sm text-muted-foreground">Moderate conditions</div>
              <div className="text-xs text-muted-foreground mt-1">Onshore but surfable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">Weekend</div>
              <div className="text-sm text-muted-foreground">Small waves</div>
              <div className="text-xs text-muted-foreground mt-1">1-2ft, longboard waves</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Footer */}
      <div className="mt-12 p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <p className="text-sm text-warning-foreground text-center">
          <strong>Safety Disclaimer:</strong> Conditions change quickly. Local knowledge beats apps. 
          Never surf alone. This tool does not guarantee safety.
        </p>
      </div>
    </div>
  );
};

export default PlanPage;