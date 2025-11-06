import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Waves, TrendingUp, UserPlus, Share2 } from 'lucide-react';
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

const PlanPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
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
    { time: '6-8am', label: 'Dawn', spots: ['Jan Juc', 'Bells Beach'], bestScore: 85, conditions: 'Light offshore winds' },
    { time: '8-10am', label: 'Morning', spots: ['13th Beach', 'Jan Juc'], bestScore: 78, conditions: 'Clean conditions' },
    { time: '12-2pm', label: 'Midday', spots: ['Torquay', 'Ocean Grove'], bestScore: 55, conditions: 'Moderate winds' },
    { time: '2-4pm', label: 'Afternoon', spots: ['13th Beach'], bestScore: 62, conditions: 'Onshore building' },
    { time: '4-6pm', label: 'Evening', spots: ['Fairhaven', 'Lorne'], bestScore: 68, conditions: 'Cross-shore winds' },
  ];

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
      
      // Create session data
      const sessionData = {
        user_id: user.id,
        title: `Surf Session - ${dateStr} at ${selectedTime}`,
        description: `Planned session for ${selectedWindow?.label || 'surf session'}. Conditions: ${selectedWindow?.conditions || 'TBD'}`,
        spot_preferences: {
          date: selectedDate.toISOString(),
          time: selectedTime,
          timeLabel: selectedWindow?.label,
          spots: selectedWindow?.spots || [],
          selectedSpots: selectedSpots.length > 0 ? selectedSpots : selectedWindow?.spots || [],
          score: selectedWindow?.bestScore || 0,
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
          Select a date and time to book your surf session
        </p>
      </div>

      {/* Weekly Outlook - Now at the top */}
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
              return (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(window.time)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-accent" />
                      <div>
                        <div className="font-semibold">{window.label}</div>
                        <div className="text-sm text-muted-foreground">{window.time}</div>
                      </div>
                    </div>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                    <div>
                      <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Best Spots
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {window.spots.map((spot, spotIndex) => (
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
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Surf Spot Selection */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-accent" />
            Select Your Preferred Surf Spots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Choose the surf spots you'd like to consider for your session
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