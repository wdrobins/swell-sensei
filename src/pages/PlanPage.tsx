import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Waves, TrendingUp, ChevronRight, Star, Info } from 'lucide-react';
import { addDays, format, isToday, isTomorrow } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { surfSpots, mockSurferProfile, ForecastData } from '@/lib/mockData';
import { calculateFitScore, FitScoreResult } from '@/lib/fitScoring';
import { checkAndAwardMilestones } from '@/lib/milestoneUtils';

interface TimeSlot {
  time: string;
  label: string;
  hour: number;
}

interface SpotRecommendation {
  spot: typeof surfSpots[0];
  fitResult: FitScoreResult;
  forecast: ForecastData;
}

const timeSlots: TimeSlot[] = [
  { time: '6-8am', label: 'Dawn', hour: 6 },
  { time: '8-10am', label: 'Morning', hour: 8 },
  { time: '10am-12pm', label: 'Late Morning', hour: 10 },
  { time: '12-2pm', label: 'Midday', hour: 12 },
  { time: '2-4pm', label: 'Afternoon', hour: 14 },
  { time: '4-6pm', label: 'Evening', hour: 16 },
];

const PlanPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [recommendations, setRecommendations] = useState<SpotRecommendation[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate mock weekly forecast scores
  const weeklyForecast = [
    { score: 75, conditions: '3-4ft Clean', quality: 'Good', swellHeight: 1.1, swellPeriod: 12, windSpeed: 12 },
    { score: 85, conditions: '4-5ft Offshore', quality: 'Excellent', swellHeight: 1.4, swellPeriod: 14, windSpeed: 8 },
    { score: 45, conditions: '2-3ft Onshore', quality: 'Fair', swellHeight: 0.8, swellPeriod: 9, windSpeed: 22 },
    { score: 65, conditions: '3-4ft Cross', quality: 'Good', swellHeight: 1.0, swellPeriod: 11, windSpeed: 15 },
    { score: 30, conditions: '1-2ft Messy', quality: 'Poor', swellHeight: 0.5, swellPeriod: 7, windSpeed: 28 },
    { score: 70, conditions: '3-4ft Clean', quality: 'Good', swellHeight: 1.0, swellPeriod: 12, windSpeed: 10 },
    { score: 80, conditions: '4-5ft Glass', quality: 'Excellent', swellHeight: 1.3, swellPeriod: 15, windSpeed: 5 }
  ];

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('skill_level, experience_years, preferred_wave_size')
        .eq('user_id', user.id)
        .single();
      
      if (!error && data) {
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Seeded random for consistent results per spot
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  // Generate recommendations when date and time are selected
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setRecommendations([]);
      return;
    }

    const dayIndex = Math.min(
      Math.floor((selectedDate.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)),
      6
    );
    const dayForecast = weeklyForecast[dayIndex] || weeklyForecast[0];

    // Base conditions adjusted by time of day
    const timeMultiplier = selectedTime.hour <= 8 ? 1.1 : selectedTime.hour >= 14 ? 0.85 : 1.0;
    const windMultiplier = selectedTime.hour <= 8 ? 0.6 : selectedTime.hour >= 14 ? 1.4 : 1.0;
    const baseSwellDir = 200; // SW swell

    // Calculate fit scores for all spots with spot-specific variations
    const spotScores: SpotRecommendation[] = surfSpots.map((spot, index) => {
      // Create spot-specific forecast variations based on location and orientation
      const spotSeed = index + dayIndex * 100 + selectedTime.hour;
      const spotVariation = seededRandom(spotSeed);
      
      // Vary swell height slightly based on spot exposure
      const exposureFactor = spot.breakType === 'point' ? 0.9 : spot.breakType === 'reef' ? 1.0 : 1.1;
      const swellHeight = dayForecast.swellHeight * timeMultiplier * exposureFactor * (0.9 + spotVariation * 0.2);
      
      // Wind direction varies - some spots get more shelter
      const shelterBonus = spot.easyEntry ? 0.8 : 1.0;
      const windSpeed = dayForecast.windSpeed * windMultiplier * shelterBonus * (0.8 + spotVariation * 0.4);
      
      // Wind direction - morning offshore, afternoon onshore with variation
      const baseWindDir = selectedTime.hour <= 10 ? 30 : 180;
      const windDirection = baseWindDir + (spotVariation * 60 - 30);
      
      // Swell direction varies slightly per spot
      const swellDirection = baseSwellDir + (spotVariation * 40 - 20);
      
      // Tide level based on time with spot-specific ideal matching
      const baseTide = 1.0 + Math.sin(selectedTime.hour / 6 * Math.PI) * 0.5;
      const tideLevel = spot.idealTide === 'low' ? baseTide * 0.7 : 
                        spot.idealTide === 'high' ? baseTide * 1.3 : baseTide;

      const forecast: ForecastData = {
        timestamp: new Date().toISOString(),
        swellHeight,
        swellPeriod: dayForecast.swellPeriod + Math.floor(spotVariation * 4 - 2),
        swellDirection,
        windSpeed,
        windDirection,
        tideLevel,
        confidence: 0.75 + spotVariation * 0.2
      };

      const fitResult = calculateFitScore(spot, forecast, mockSurferProfile);
      return { spot, fitResult, forecast };
    });

    // Sort by score and take top recommendations
    const sorted = spotScores.sort((a, b) => b.fitResult.score - a.fitResult.score);
    setRecommendations(sorted.slice(0, 5));
  }, [selectedDate, selectedTime]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setRecommendations([]);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedTime(slot);
  };

  const handleBookSession = async (recommendation: SpotRecommendation) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a session.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!selectedDate || !selectedTime) return;

    setIsBooking(true);

    try {
      const dateStr = format(selectedDate, 'EEEE, MMMM d, yyyy');
      
      const sessionData = {
        user_id: user.id,
        title: `${recommendation.spot.name} - ${dateStr} at ${selectedTime.time}`,
        description: `Fit Score: ${recommendation.fitResult.score} (${recommendation.fitResult.label}). ${recommendation.fitResult.coachingTip}`,
        spot_preferences: {
          date: selectedDate.toISOString(),
          time: selectedTime.time,
          timeLabel: selectedTime.label,
          spotId: recommendation.spot.id,
          spotName: recommendation.spot.name,
          score: recommendation.fitResult.score,
          conditions: `${(recommendation.forecast.swellHeight * 3.28).toFixed(0)}ft @ ${recommendation.forecast.swellPeriod}s`
        }
      };

      const { error } = await supabase
        .from('sessions')
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: "Session booked!",
        description: `Your session at ${recommendation.spot.name} for ${dateStr} at ${selectedTime.time} has been saved.`,
      });

      // Check for milestones
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id);

      if (allSessions) {
        const result = await checkAndAwardMilestones({
          userId: user.id,
          sessions: allSessions
        });

        if (result.awarded && result.awarded.length > 0) {
          setTimeout(() => {
            toast({
              title: "🎉 New Badge Earned!",
              description: `You earned: ${result.awarded.map(m => m.badge_name).join(', ')}`,
            });
          }, 1000);
        }
      }

      setTimeout(() => navigate('/logs'), 2000);
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking failed",
        description: "There was an error booking your session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getWaveHeightRange = (meters: number): string => {
    const feet = meters * 3.28084;
    const low = Math.max(0, feet - 0.5).toFixed(0);
    const high = (feet + 0.5).toFixed(0);
    return `${low}-${high}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Plan Your Session
        </h1>
        <p className="text-muted-foreground">
          Select a day and time, and we'll recommend the best spot for you
        </p>
      </div>

      {/* Step 1: Select Day */}
      <Card className="mb-6 shadow-float bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Step 1: Choose Your Day
            {selectedDate && (
              <Badge variant="success" className="ml-auto">
                {isToday(selectedDate) ? 'Today' : isTomorrow(selectedDate) ? 'Tomorrow' : format(selectedDate, 'EEE, MMM d')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {weeklyForecast.map((day, index) => {
              const date = addDays(new Date(), index);
              const dayName = isToday(date) 
                ? 'Today' 
                : isTomorrow(date) 
                  ? 'Tomorrow' 
                  : format(date, 'EEE');
              const dateStr = format(date, 'MMM d');
              const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`text-center p-4 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary' 
                      : 'bg-background/50 hover:bg-background border border-border/50'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{dayName}</div>
                  <div className="text-xs mb-2 opacity-80">{dateStr}</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    isSelected ? '' : getScoreColor(day.score)
                  }`}>
                    {day.score}
                  </div>
                  <div className="text-xs opacity-80 mb-1">{day.quality}</div>
                  <div className="text-xs opacity-70">{day.conditions}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Time */}
      {selectedDate && (
        <Card className="mb-6 shadow-float animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Step 2: Choose Your Time
              {selectedTime && (
                <Badge variant="accent" className="ml-auto">
                  {selectedTime.label} ({selectedTime.time})
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedTime?.time === slot.time;
                const isMorning = slot.hour <= 10;
                
                return (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot)}
                    className={`text-center p-4 rounded-lg transition-all hover:scale-105 ${
                      isSelected 
                        ? 'bg-accent text-accent-foreground shadow-lg ring-2 ring-accent' 
                        : 'bg-background/50 hover:bg-background border border-border/50'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">{slot.label}</div>
                    <div className="text-lg font-semibold">{slot.time}</div>
                    {isMorning && !isSelected && (
                      <div className="text-xs text-success mt-1">Best winds</div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Morning sessions (6-10am) typically have the best conditions with lighter offshore winds.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Recommendations */}
      {recommendations.length > 0 && (
        <Card className="shadow-float animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning" />
              Recommended Spots for {selectedTime?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={rec.spot.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    index === 0 
                      ? 'bg-gradient-to-r from-success/10 to-accent/10 border-success/30' 
                      : 'bg-background/50 border-border/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {index === 0 && (
                          <Badge variant="success" className="text-xs">
                            Top Pick
                          </Badge>
                        )}
                        <h3 className="text-lg font-semibold">{rec.spot.name}</h3>
                        <Badge 
                          variant={rec.fitResult.color as any}
                          className="text-xs"
                        >
                          {rec.fitResult.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {rec.spot.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Waves className="h-3 w-3" />
                          {getWaveHeightRange(rec.forecast.swellHeight)}ft @ {rec.forecast.swellPeriod}s
                        </span>
                        <span className="capitalize">{rec.spot.breakType}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {rec.fitResult.coachingTip}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(rec.fitResult.score)}`}>
                          {rec.fitResult.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Fit Score</div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => handleBookSession(rec)}
                          disabled={isBooking}
                          size="sm"
                          className="bg-gradient-ocean hover:opacity-90"
                        >
                          {isBooking ? 'Booking...' : 'Book Session'}
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link to={`/spots/${rec.spot.id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedDate && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Select a day above to get started</p>
          <p className="text-sm">We'll find the best spot for your session</p>
        </div>
      )}

      {selectedDate && !selectedTime && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Now choose your preferred time</p>
          <p className="text-sm">Morning sessions typically have better conditions</p>
        </div>
      )}
    </div>
  );
};

export default PlanPage;
