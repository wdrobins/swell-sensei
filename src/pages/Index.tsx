import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FitScoreCard from '@/components/FitScoreCard';
import SpotCard from '@/components/SpotCard';
import InteractiveSurfPrompt from '@/components/InteractiveSurfPrompt';
import { surfSpots, mockForecast, mockSurferProfile } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { 
  Waves, TrendingUp, Clock, MapPin, 
  ArrowRight, Sun, Wind, Calendar,
  CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addDays, format } from 'date-fns';

const Index = () => {
  // Calculate fit scores for recommended spots based on skill level and experience
  const skillLevelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
  const userSkillMap = { 'waist': 1, 'shoulder': 2, 'head': 3, 'overhead': 4, 'double-overhead': 5 };
  const userSkillLevel = userSkillMap[mockSurferProfile.comfortableWaveSize] || 2;
  
  const recommendedSpotResults = surfSpots
    .filter(spot => {
      // Filter spots that match user's experience types
      const matchesExperience = mockSurferProfile.experienceTypes.includes(spot.breakType);
      // Filter spots at or slightly above user's skill level for progression
      const spotSkillLevel = skillLevelMap[spot.skillLevel];
      const matchesSkill = spotSkillLevel <= userSkillLevel + 1;
      return matchesExperience && matchesSkill;
    })
    .map(spot => {
      const forecast = mockForecast[spot.id]?.[0];
      if (!forecast) return null;
      
      const result = calculateFitScore(spot, forecast, mockSurferProfile);
      return { spot, result };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.result.score || 0) - (a?.result.score || 0)) as Array<{ spot: any; result: any }>;

  // Find best spot today
  const bestSpot = recommendedSpotResults.reduce((best, current) => 
    !best || current.result.score > best.result.score ? current : best
  , null as any);

  const todaysConditions = [
    { label: 'Swell', value: '1.5-2m SW', icon: Waves, color: 'text-accent' },
    { label: 'Wind', value: '10-15kt NE', icon: Wind, color: 'text-primary' },
    { label: 'Tide', value: 'Rising to 1.2m', icon: Clock, color: 'text-success' },
    { label: 'Weather', value: '18°C Partly cloudy', icon: Sun, color: 'text-warning' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-depth text-white py-16 px-4">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-float mb-6">
              <Waves className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Surf Caddy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Get personalized surf recommendations and safety guidance
              based on your skill level and current conditions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-float">
                <Link to="/onboarding">Setup Profile</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/80 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link to="/spots">Find Your Wave</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Interactive Surf Prompt */}
        <div className="mb-12">
          <InteractiveSurfPrompt />
        </div>

        {/* Quick Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Today's Best Spot */}
          <div className="lg:col-span-2">
            {bestSpot && (
              <FitScoreCard 
                result={bestSpot.result} 
                spotName={bestSpot.spot.name}
              />
            )}
          </div>

          {/* Today's Conditions */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaysConditions.map((condition, index) => {
                const Icon = condition.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${condition.color}`} />
                      <span className="text-sm text-muted-foreground">{condition.label}</span>
                    </div>
                    <span className="text-sm font-medium">{condition.value}</span>
                  </div>
                );
              })}
              
              <div className="pt-2 border-t">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/plan">Plan Your Session</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Spots */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Your Recommended Spots</h2>
            <Button asChild variant="ghost" className="text-primary">
              <Link to="/spots" className="flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSpotResults.slice(0, 3).map(({ spot, result }) => (
              <SpotCard 
                key={spot.id}
                spot={spot}
                fitScore={result.score}
                fitLabel={result.label}
                showFitScore={true}
              />
            ))}
          </div>
        </section>

        {/* Weekly Outlook */}
        <section className="mb-12">
          <Card className="shadow-wave bg-gradient-to-r from-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                7-Day Surf Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[
                  { score: 75, conditions: '2ft Clean', color: 'accent' },
                  { score: 85, conditions: '3ft Offshore', color: 'success' },
                  { score: 45, conditions: '2ft Onshore', color: 'warning' },
                  { score: 65, conditions: '2-3ft Cross', color: 'accent' },
                  { score: 30, conditions: '1ft Messy', color: 'destructive' },
                  { score: 70, conditions: '2ft Clean', color: 'accent' },
                  { score: 80, conditions: '3ft Glass', color: 'success' }
                ].map((forecast, index) => {
                  const date = addDays(new Date(), index);
                  const dayLabel = index === 0 ? 'Today' : format(date, 'EEE');
                  const dateLabel = format(date, 'MMM d');
                  
                  return (
                    <Card key={index} className="text-center p-3">
                      <div className="text-sm font-medium mb-1">{dayLabel}</div>
                      <div className="text-xs text-muted-foreground mb-1">{dateLabel}</div>
                      <div className="text-2xl font-bold mb-1">{forecast.score}</div>
                      <Badge variant={forecast.color as any} className="text-xs">
                        {forecast.conditions}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center">
                  Tuesday looks like the best day this week! Plan ahead for optimal conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group cursor-pointer hover:shadow-float transition-all duration-300 hover:scale-[1.02]">
              <Link to="/plan">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Plan Session</h3>
                  <p className="text-sm text-muted-foreground">
                    Find the best time and spot for your next surf
                  </p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group cursor-pointer hover:shadow-float transition-all duration-300 hover:scale-[1.02]">
              <Link to="/spots">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-12 w-12 text-accent mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Explore Spots</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover new surf breaks that match your skill level
                  </p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="group cursor-pointer hover:shadow-float transition-all duration-300 hover:scale-[1.02]">
              <Link to="/profile">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-success mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Log sessions and improve your surfing skills
                  </p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </section>

        {/* Safety & Features */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  Safety First
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-success rounded-full" />
                    Skill-based wave recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-success rounded-full" />
                    Real-time hazard warnings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-success rounded-full" />
                    Conservative safety approach
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-success rounded-full" />
                    Local knowledge integration
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="shadow-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Waves className="h-5 w-5" />
                  Smart Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Multi-source forecast aggregation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Personalized fit scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Alternative spot suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full" />
                    Progressive coaching tips
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Safety Disclaimer */}
        <div className="mt-12 p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <p className="text-sm text-warning-foreground">
                <strong>Safety Disclaimer:</strong> Conditions change quickly. Local knowledge beats apps. 
                Never surf alone. This tool does not guarantee safety - always use your own judgment 
                and respect the ocean.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
