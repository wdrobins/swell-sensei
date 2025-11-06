import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Waves, TrendingUp } from 'lucide-react';
import { addDays, format, isToday, isTomorrow } from 'date-fns';

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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { score: 75, conditions: '2ft Clean', quality: 'Good' },
              { score: 85, conditions: '3ft Offshore', quality: 'Excellent' },
              { score: 45, conditions: '2ft Onshore', quality: 'Fair' },
              { score: 65, conditions: '2-3ft Cross', quality: 'Good' },
              { score: 30, conditions: '1ft Messy', quality: 'Poor' },
              { score: 70, conditions: '2ft Clean', quality: 'Good' },
              { score: 80, conditions: '3ft Glass', quality: 'Excellent' }
            ].map((day, index) => {
              const date = addDays(new Date(), index);
              const dayName = isToday(date) 
                ? 'Today' 
                : isTomorrow(date) 
                  ? 'Tomorrow' 
                  : format(date, 'EEE');
              const dateStr = format(date, 'MMM d');
              
              return (
                <div key={index} className="text-center p-3 bg-background/50 rounded-lg">
                  <div className="text-sm font-medium mb-1">{dayName}</div>
                  <div className="text-xs text-muted-foreground mb-2">{dateStr}</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    day.score >= 80 ? 'text-success' :
                    day.score >= 60 ? 'text-accent' :
                    day.score >= 40 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {day.score}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">{day.quality}</div>
                  <div className="text-xs text-muted-foreground">{day.conditions}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {(() => {
                const bestDayIndex = [75, 85, 45, 65, 30, 70, 80].indexOf(85);
                const bestDate = addDays(new Date(), bestDayIndex);
                const bestDayName = isToday(bestDate) 
                  ? 'Today' 
                  : isTomorrow(bestDate) 
                    ? 'Tomorrow' 
                    : format(bestDate, 'EEEE');
                return `${bestDayName} looks like the best day this week! Plan ahead for optimal conditions.`;
              })()}
            </p>
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