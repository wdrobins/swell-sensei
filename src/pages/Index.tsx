import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import FitScoreCard from '@/components/FitScoreCard';
import SpotCard from '@/components/SpotCard';
import { surfSpots, mockForecast, mockSurferProfile, ForecastData } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { 
  Waves, TrendingUp, Clock, MapPin, 
  ArrowRight, Sun, Wind, Calendar,
  CheckCircle2, AlertTriangle, Sunrise, Sunset
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { addDays, format } from 'date-fns';

// Get time-of-day label and info
const getTimeOfDayInfo = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 8) {
    return { label: 'Dawn', period: 'dawn', icon: Sunrise, quality: 'excellent', message: 'Light winds and clean conditions - best time to surf!' };
  } else if (hour >= 8 && hour < 11) {
    return { label: 'Morning', period: 'morning', icon: Sun, quality: 'good', message: 'Still good conditions before the wind picks up.' };
  } else if (hour >= 11 && hour < 14) {
    return { label: 'Midday', period: 'midday', icon: Sun, quality: 'fair', message: 'Winds typically building - check conditions carefully.' };
  } else if (hour >= 14 && hour < 17) {
    return { label: 'Afternoon', period: 'afternoon', icon: Wind, quality: 'variable', message: 'Often windy - look for sheltered spots.' };
  } else if (hour >= 17 && hour < 20) {
    return { label: 'Evening', period: 'evening', icon: Sunset, quality: 'improving', message: 'Winds often ease - glass-off conditions possible.' };
  } else {
    return { label: 'Night', period: 'night', icon: Clock, quality: 'none', message: 'Wait for dawn patrol tomorrow!' };
  }
};

const Index = () => {
  const timeInfo = getTimeOfDayInfo();
  const currentHour = new Date().getHours();
  
  // Calculate time-adjusted forecasts for all spots
  const timeAdjustedResults = useMemo(() => {
    // Seeded random for consistency
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const timeMultiplier = currentHour <= 8 ? 1.1 : currentHour >= 14 ? 0.85 : 1.0;
    const windMultiplier = currentHour <= 8 ? 0.6 : currentHour >= 14 ? 1.4 : 1.0;
    
    return surfSpots.map((spot, index) => {
      const baseForecast = mockForecast[spot.id]?.[0];
      if (!baseForecast) return null;
      
      const spotVariation = seededRandom(index + currentHour);
      
      // Adjust forecast based on time of day
      const forecast: ForecastData = {
        ...baseForecast,
        swellHeight: baseForecast.swellHeight * timeMultiplier * (0.9 + spotVariation * 0.2),
        windSpeed: baseForecast.windSpeed * windMultiplier * (0.8 + spotVariation * 0.4),
        windDirection: currentHour <= 10 ? 30 + spotVariation * 30 : 150 + spotVariation * 60,
      };
      
      const result = calculateFitScore(spot, forecast, mockSurferProfile);
      return { spot, result, forecast };
    }).filter(Boolean) as Array<{ spot: any; result: any; forecast: ForecastData }>;
  }, [currentHour]);

  // Find best spot for right now
  const bestSpotNow = useMemo(() => {
    return timeAdjustedResults.reduce((best, current) => 
      !best || current.result.score > best.result.score ? current : best
    , null as any);
  }, [timeAdjustedResults]);

  // Calculate fit scores for recommended spots based on skill level and experience
  const skillLevelMap = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
  const userSkillMap = { 'waist': 1, 'shoulder': 2, 'head': 3, 'overhead': 4, 'double-overhead': 5 };
  const userSkillLevel = userSkillMap[mockSurferProfile.comfortableWaveSize] || 2;
  
  const recommendedSpotResults = timeAdjustedResults
    .filter(item => {
      const matchesExperience = mockSurferProfile.experienceTypes.includes(item.spot.breakType);
      const spotSkillLevel = skillLevelMap[item.spot.skillLevel as keyof typeof skillLevelMap];
      const matchesSkill = spotSkillLevel <= userSkillLevel + 1;
      return matchesExperience && matchesSkill;
    })
    .sort((a, b) => b.result.score - a.result.score);

  const todaysConditions = [
    { label: 'Swell', value: '1.5-2m SW', icon: Waves, color: 'text-accent' },
    { label: 'Wind', value: '10-15kt NE', icon: Wind, color: 'text-primary' },
    { label: 'Tide', value: 'Rising to 1.2m', icon: Clock, color: 'text-success' },
    { label: 'Weather', value: '18°C Partly cloudy', icon: Sun, color: 'text-warning' }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-accent';
      case 'improving': return 'text-accent';
      case 'fair': return 'text-warning';
      case 'variable': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

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
              Surf Daddy
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
        {/* Time-Based Recommendation */}
        <Card className="mb-8 shadow-float bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <timeInfo.icon className="h-5 w-5 text-primary" />
              Best Spot Right Now ({timeInfo.label})
              <Badge variant="outline" className={`ml-auto ${getQualityColor(timeInfo.quality)}`}>
                {timeInfo.quality.charAt(0).toUpperCase() + timeInfo.quality.slice(1)} Conditions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{timeInfo.message}</p>
            {bestSpotNow && timeInfo.quality !== 'none' ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{bestSpotNow.spot.name}</h3>
                    <Badge variant={bestSpotNow.result.color as any}>
                      {bestSpotNow.result.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {bestSpotNow.spot.region} • {bestSpotNow.spot.breakType} break
                  </p>
                  <p className="text-sm">{bestSpotNow.result.coachingTip}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      bestSpotNow.result.score >= 80 ? 'text-success' :
                      bestSpotNow.result.score >= 60 ? 'text-accent' :
                      bestSpotNow.result.score >= 40 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {bestSpotNow.result.score}
                    </div>
                    <div className="text-xs text-muted-foreground">Fit Score</div>
                  </div>
                  <Button asChild className="bg-gradient-ocean">
                    <Link to={`/spots/${bestSpotNow.spot.id}`}>
                      View Spot
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Check back at dawn for the best conditions!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Today's Best Spot - FitScoreCard */}
          <div className="lg:col-span-2">
            {bestSpotNow && (
              <FitScoreCard 
                result={bestSpotNow.result} 
                spotName={bestSpotNow.spot.name}
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
