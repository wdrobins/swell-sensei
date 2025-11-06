import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Waves, TrendingUp, UserPlus, Share2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { addDays, format, isToday, isTomorrow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const PlanPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [expandedTimeSlot, setExpandedTimeSlot] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const allSurfSpots = [
    'Jan Juc',
    'Bells Beach',
    '13th Beach',
    'Torquay',
    'Ocean Grove',
    'Fairhaven',
    'Lorne',
    'Point Addis',
    'Winki Pop'
  ];

  // Fetch user profile with skill level
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('skill_level, experience_years, preferred_wave_size')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, [user]);

  const weeklyForecast = [
    { score: 75, conditions: '2ft Clean', quality: 'Good' },
    { score: 85, conditions: '3ft Offshore', quality: 'Excellent' },
    { score: 45, conditions: '2ft Onshore', quality: 'Fair' },
    { score: 65, conditions: '2-3ft Cross', quality: 'Good' },
    { score: 30, conditions: '1ft Messy', quality: 'Poor' },
    { score: 70, conditions: '2ft Clean', quality: 'Good' },
    { score: 80, conditions: '3ft Glass', quality: 'Excellent' }
  ];

  const timeWindows = [
    { 
      time: '6-8am', 
      label: 'Dawn', 
      conditions: 'Light offshore winds',
      spotScores: {
        'Jan Juc': 85,
        'Bells Beach': 82,
        '13th Beach': 75,
        'Torquay': 70,
        'Ocean Grove': 65,
        'Fairhaven': 60,
        'Lorne': 58,
        'Point Addis': 78,
        'Winki Pop': 80
      }
    },
    { 
      time: '8-10am', 
      label: 'Morning', 
      conditions: 'Clean conditions',
      spotScores: {
        'Jan Juc': 78,
        'Bells Beach': 76,
        '13th Beach': 82,
        'Torquay': 72,
        'Ocean Grove': 68,
        'Fairhaven': 65,
        'Lorne': 62,
        'Point Addis': 74,
        'Winki Pop': 75
      }
    },
    { 
      time: '12-2pm', 
      label: 'Midday', 
      conditions: 'Moderate winds',
      spotScores: {
        'Jan Juc': 50,
        'Bells Beach': 52,
        '13th Beach': 48,
        'Torquay': 58,
        'Ocean Grove': 55,
        'Fairhaven': 45,
        'Lorne': 42,
        'Point Addis': 48,
        'Winki Pop': 50
      }
    },
    { 
      time: '2-4pm', 
      label: 'Afternoon', 
      conditions: 'Onshore building',
      spotScores: {
        'Jan Juc': 58,
        'Bells Beach': 60,
        '13th Beach': 65,
        'Torquay': 55,
        'Ocean Grove': 52,
        'Fairhaven': 48,
        'Lorne': 45,
        'Point Addis': 62,
        'Winki Pop': 58
      }
    },
    { 
      time: '4-6pm', 
      label: 'Evening', 
      conditions: 'Cross-shore winds',
      spotScores: {
        'Jan Juc': 62,
        'Bells Beach': 65,
        '13th Beach': 60,
        'Torquay': 58,
        'Ocean Grove': 55,
        'Fairhaven': 70,
        'Lorne': 68,
        'Point Addis': 66,
        'Winki Pop': 64
      }
    },
  ];

  const getTimeWindowScore = (window: typeof timeWindows[0]) => {
    if (selectedSpots.length === 0) {
      // If no spots selected, show average of all spots
      const scores = Object.values(window.spotScores);
      return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
    
    // Calculate average score for selected spots
    const selectedScores = selectedSpots.map(spot => window.spotScores[spot] || 0);
    return Math.round(selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length);
  };

  const getBestSpotsForWindow = (window: typeof timeWindows[0]) => {
    if (selectedSpots.length === 0) {
      // Show top 2 spots if no selection
      return Object.entries(window.spotScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([spot]) => spot);
    }
    
    // Show selected spots sorted by score
    return selectedSpots
      .map(spot => ({ spot, score: window.spotScores[spot] || 0 }))
      .sort((a, b) => b.score - a.score)
      .map(({ spot }) => spot);
  };

  const getRecommendationForSpot = (spotScore: number, skillLevel: string | null) => {
    if (!skillLevel) {
      return { text: 'Set your skill level in profile for personalized recommendations', color: 'text-muted-foreground' };
    }

    // Adjust recommendations based on skill level
    const thresholds = {
      beginner: { safe: 50, good: 40, stretch: 30 },
      intermediate: { safe: 65, good: 55, stretch: 45 },
      advanced: { safe: 75, good: 65, stretch: 55 },
      expert: { safe: 80, good: 70, stretch: 60 }
    };

    const level = thresholds[skillLevel as keyof typeof thresholds] || thresholds.intermediate;

    if (spotScore >= level.safe) {
      return { 
        text: `Perfect for your ${skillLevel} level! Go for it!`, 
        color: 'text-success',
        icon: '✓'
      };
    } else if (spotScore >= level.good) {
      return { 
        text: `Good conditions for your skill level`, 
        color: 'text-accent',
        icon: '→'
      };
    } else if (spotScore >= level.stretch) {
      return { 
        text: `Challenging - push your limits carefully`, 
        color: 'text-warning',
        icon: '!'
      };
    } else {
      return { 
        text: `Not recommended for ${skillLevel}s today`, 
        color: 'text-destructive',
        icon: '×'
      };
    }
  };

  const toggleTimeSlot = (timeSlot: string) => {
    setExpandedTimeSlot(expandedTimeSlot === timeSlot ? null : timeSlot);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const toggleSpot = (spot: string) => {
    setSelectedSpots(prev => 
      prev.includes(spot) 
        ? prev.filter(s => s !== spot)
        : [...prev, spot]
    );
  };

  const handleInvite = () => {
    const sessionDetails = `Join me for a surf session on ${format(selectedDate, 'EEEE, MMMM d, yyyy')} at ${selectedTime}!`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Surf Session Invite',
        text: sessionDetails,
        url: shareUrl,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(`${sessionDetails}\n${shareUrl}`);
        toast({
          title: "Link copied!",
          description: "Session details copied to clipboard.",
        });
      });
    } else {
      navigator.clipboard.writeText(`${sessionDetails}\n${shareUrl}`);
      toast({
        title: "Link copied!",
        description: "Session details copied to clipboard.",
      });
    }
    setInviteDialogOpen(false);
  };

  const handleBookSession = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (!selectedTime) return;

    setIsBooking(true);

    try {
      // Find the selected time window details
      const selectedWindow = timeWindows.find(w => w.time === selectedTime);
      const dateStr = format(selectedDate, 'EEEE, MMMM d, yyyy');
      const windowScore = selectedWindow ? getTimeWindowScore(selectedWindow) : 0;
      const bestSpots = selectedWindow ? getBestSpotsForWindow(selectedWindow) : [];
      
      // Create session data
      const sessionData = {
        user_id: user.id,
        title: `Surf Session - ${dateStr} at ${selectedTime}`,
        description: `Planned session for ${selectedWindow?.label || 'surf session'}. Conditions: ${selectedWindow?.conditions || 'TBD'}`,
        spot_preferences: {
          date: selectedDate.toISOString(),
          time: selectedTime,
          timeLabel: selectedWindow?.label,
          spots: bestSpots,
          selectedSpots: selectedSpots.length > 0 ? selectedSpots : bestSpots,
          score: windowScore,
          conditions: selectedWindow?.conditions || ''
        }
      };

      const { error } = await supabase
        .from('sessions')
        .insert(sessionData);

      if (error) throw error;

      toast({
        title: "Session booked!",
        description: `Your surf session for ${dateStr} at ${selectedTime} has been saved.`,
      });

      // Navigate to logs page after short delay
      setTimeout(() => {
        navigate('/logs');
      }, 1500);

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Plan Your Session
        </h1>
        <p className="text-muted-foreground">
          Select your preferred surf spots, then choose a date and time
        </p>
      </div>

      {/* Surf Spot Selection - Now at the top */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Select Your Preferred Surf Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the surf spots you'd like to consider - time slot ratings will update based on your selection
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {allSurfSpots.map((spot) => (
              <button
                key={spot}
                onClick={() => toggleSpot(spot)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedSpots.includes(spot)
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{spot}</span>
                </div>
              </button>
            ))}
          </div>
          {selectedSpots.length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium">
                Selected: {selectedSpots.join(', ')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Outlook */}
      <Card className="mb-6 shadow-float bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            This Week's Forecast - Select Your Day
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
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`text-center p-4 rounded-lg transition-all hover:scale-105 cursor-pointer ${
                    isSelected 
                      ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary' 
                      : 'bg-background/50 hover:bg-background'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">{dayName}</div>
                  <div className="text-xs mb-2 opacity-80">{dateStr}</div>
                  <div className={`text-2xl font-bold mb-1 ${
                    isSelected ? '' :
                    day.score >= 80 ? 'text-success' :
                    day.score >= 60 ? 'text-accent' :
                    day.score >= 40 ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {day.score}
                  </div>
                  <div className="text-xs opacity-80 mb-1">{day.quality}</div>
                  <div className="text-xs opacity-70">{day.conditions}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              {(() => {
                const bestDayIndex = weeklyForecast.findIndex(d => d.score === Math.max(...weeklyForecast.map(day => day.score)));
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

      {/* Selected Date Display */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select your preferred time slot below to book your surf session
          </p>
        </CardContent>
      </Card>

      {/* Time Window Selection */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeWindows.map((window, index) => {
              const isSelected = selectedTime === window.time;
              const isExpanded = expandedTimeSlot === window.time;
              const score = getTimeWindowScore(window);
              const bestSpots = getBestSpotsForWindow(window);
              
              return (
                <Collapsible
                  key={index}
                  open={isExpanded}
                  onOpenChange={() => toggleTimeSlot(window.time)}
                >
                  <div
                    className={`w-full rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-accent" />
                          <div>
                            <div className="font-semibold">{window.label}</div>
                            <div className="text-sm text-muted-foreground">{window.time}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-foreground">{score}</div>
                            <Badge variant={
                              score >= 80 ? 'success' :
                              score >= 60 ? 'accent' :
                              score >= 40 ? 'warning' : 'destructive'
                            }>
                              {score >= 80 ? 'Safe' :
                               score >= 60 ? 'Good' :
                               score >= 40 ? 'Stretch' : 'No-Go'}
                            </Badge>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                        <div>
                          <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            {selectedSpots.length > 0 ? 'Your Spots' : 'Best Spots'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {bestSpots.map((spot, spotIndex) => (
                              <Badge key={spotIndex} variant="secondary" className="text-xs">
                                {spot}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                            Conditions
                          </h4>
                          <div className="flex items-center gap-2">
                            <Waves className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{window.conditions}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 border-t">
                        <div className="pt-4 space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold text-sm">
                              Individual Spot Ratings {userProfile?.skill_level && `(${userProfile.skill_level})`}
                            </h4>
                          </div>
                          
                          {selectedSpots.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                              Select surf spots above to see personalized ratings and recommendations
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {selectedSpots.map((spot) => {
                                const spotScore = window.spotScores[spot] || 0;
                                const recommendation = getRecommendationForSpot(spotScore, userProfile?.skill_level);
                                
                                return (
                                  <div key={spot} className="p-3 rounded-lg bg-background border">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-accent" />
                                        <span className="font-medium">{spot}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold">{spotScore}</span>
                                        <Badge 
                                          variant={
                                            spotScore >= 80 ? 'success' :
                                            spotScore >= 60 ? 'accent' :
                                            spotScore >= 40 ? 'warning' : 'destructive'
                                          }
                                          className="text-xs"
                                        >
                                          {spotScore >= 80 ? 'Excellent' :
                                           spotScore >= 60 ? 'Good' :
                                           spotScore >= 40 ? 'Fair' : 'Poor'}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className={`text-sm flex items-center gap-2 ${recommendation.color}`}>
                                      <span className="font-bold">{recommendation.icon}</span>
                                      <span>{recommendation.text}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          <Button
                            onClick={() => handleTimeSelect(window.time)}
                            className="w-full mt-3"
                            variant={isSelected ? "default" : "outline"}
                          >
                            {isSelected ? 'Selected' : 'Select This Time'}
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Book Session & Invite Buttons */}
      {selectedTime && (
        <Card className="mb-6 shadow-float bg-gradient-to-r from-success/10 to-accent/10 border-success/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Ready to book your session?</h3>
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, MMMM d')} at {selectedTime}
                  {selectedSpots.length > 0 && ` • ${selectedSpots.length} spot${selectedSpots.length > 1 ? 's' : ''} selected`}
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="flex-1 md:flex-none"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Someone
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Someone to Join</DialogTitle>
                      <DialogDescription>
                        Share this session with your surf buddies!
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Session Details:</p>
                        <p className="text-sm text-muted-foreground">
                          {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                        </p>
                        {selectedSpots.length > 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Spots: {selectedSpots.join(', ')}
                          </p>
                        )}
                      </div>
                      <Button onClick={handleInvite} className="w-full">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Session
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="lg" 
                  onClick={handleBookSession}
                  disabled={isBooking}
                  className="flex-1 md:flex-none"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {isBooking ? 'Booking...' : 'Book Session'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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