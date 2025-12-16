import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import FitScoreCard from '@/components/FitScoreCard';
import ForecastChart from '@/components/ForecastChart';
import { surfSpots, mockForecast, mockSurferProfile, ForecastData } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { useMarineForecast } from '@/hooks/useMarineForecast';
import { degreesArrayToCompass, getTideMovementDescription, getLocalismColor } from '@/lib/compassUtils';
import { 
  ArrowLeft, MapPin, Waves, Wind, Compass, Clock, 
  AlertTriangle, Users, Shield, CheckCircle2, Cloud,
  Car, Coffee, ArrowUpDown
} from 'lucide-react';

const SpotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const spot = surfSpots.find(s => s.id === id);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  // Fetch real forecast data if spot exists
  const { data: forecastData, isLoading, isError } = useMarineForecast(
    spot?.coordinates[0] || 0,
    spot?.coordinates[1] || 0,
    !!spot
  );
  
  if (!spot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Spot Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The surf spot you're looking for doesn't exist.
            </p>
            <Button asChild>
              <Link to="/spots">Back to Spots</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get selected day's forecast data
  const selectedDayData = forecastData?.daily?.[selectedDayIndex];

  // Use real forecast data if available, otherwise fallback to mock
  let forecast: ForecastData | undefined;
  let isRealData = false;
  
  if (selectedDayData && !isError) {
    isRealData = true;
    forecast = {
      timestamp: selectedDayData.date,
      swellHeight: selectedDayData.swellHeight || selectedDayData.waveHeight,
      swellPeriod: selectedDayData.swellPeriod,
      swellDirection: selectedDayData.swellDirection,
      windSpeed: selectedDayData.windSpeed,
      windDirection: selectedDayData.windDirection,
      tideLevel: 1.0,
      confidence: 0.85
    };
  } else if (forecastData?.current && !isError) {
    isRealData = true;
    forecast = {
      timestamp: forecastData.current.timestamp,
      swellHeight: forecastData.current.swellHeight || forecastData.current.waveHeight,
      swellPeriod: forecastData.current.swellPeriod || forecastData.current.wavePeriod,
      swellDirection: forecastData.current.swellDirection || forecastData.current.waveDirection,
      windSpeed: forecastData.current.windSpeed,
      windDirection: forecastData.current.windDirection,
      tideLevel: 1.0,
      confidence: 0.85
    };
  } else {
    forecast = mockForecast[spot.id]?.[0];
  }
  
  const fitResult = forecast 
    ? calculateFitScore(spot, forecast, mockSurferProfile) 
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/spots" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Spots
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          {spot.name}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{spot.region}</span>
            <span className="text-xs">•</span>
            <span className="capitalize">{spot.breakType} break</span>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm">
              <Cloud className="h-4 w-4 animate-pulse" />
              <span>Loading live forecast...</span>
            </div>
          )}
          {isRealData && !isLoading && (
            <div className="flex items-center gap-2 text-sm text-success">
              <Cloud className="h-4 w-4" />
              <span>Live forecast data</span>
            </div>
          )}
        </div>
      </div>

      {/* 7-Day Forecast Chart - Full width at top */}
      {isLoading ? (
        <Card className="shadow-float mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      ) : forecastData?.daily && forecastData.daily.length > 0 ? (
        <div className="mb-6">
          <ForecastChart 
            dailyForecast={forecastData.daily} 
            selectedDayIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fit Score - Full width on mobile, spans 2 cols on desktop */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Card className="shadow-float">
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : fitResult ? (
            <FitScoreCard result={fitResult} spotName={spot.name} />
          ) : (
            <Card className="shadow-float">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  Forecast data unavailable for this spot
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Spot Details */}
        <div className="space-y-6">
          {/* Current Forecast */}
          <Card className="shadow-float bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                Current Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : forecast ? (
                <>
                  {/* Wave Height */}
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Waves className="h-5 w-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Wave Height</span>
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {Math.round(forecast.swellHeight * 3.28084)}ft
                    </span>
                  </div>
                  
                  {/* Swell Period */}
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Swell Period</span>
                    </div>
                    <span className="text-xl font-bold">{Math.round(forecast.swellPeriod)}s</span>
                  </div>
                  
                  {/* Swell Direction */}
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Compass className="h-5 w-5 text-accent" />
                      <span className="text-sm text-muted-foreground">Swell Direction</span>
                    </div>
                    <span className="text-lg font-medium">
                      {Math.round(forecast.swellDirection)}° ({degreesArrayToCompass([forecast.swellDirection])})
                    </span>
                  </div>
                  
                  {/* Wind */}
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wind className="h-5 w-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Wind</span>
                    </div>
                    <span className="text-lg font-medium">
                      {Math.round(forecast.windSpeed)}kts {degreesArrayToCompass([forecast.windDirection])}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground">No forecast data available</p>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-accent" />
                Spot Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Break Type:</span>
                <span className="capitalize font-medium">{spot.breakType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bottom:</span>
                <span className="font-medium">{spot.bottom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skill Level:</span>
                <Badge variant={
                  spot.skillLevel === 'beginner' ? 'success' :
                  spot.skillLevel === 'intermediate' ? 'accent' :
                  spot.skillLevel === 'advanced' ? 'warning' : 'destructive'
                }>
                  {spot.skillLevel}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crowd Factor:</span>
                <span className="font-medium">{spot.crowdFactor}/10</span>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-primary" />
                Ideal Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {forecast && (
                <div>
                  <span className="text-muted-foreground text-sm">Current Swell Period:</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Waves className="h-4 w-4 text-primary" />
                    <span className="font-medium">{Math.round(forecast.swellPeriod)}s</span>
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground text-sm">Swell Direction:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Compass className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {degreesArrayToCompass(spot.idealSwellDirs)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Wind Direction:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {degreesArrayToCompass(spot.idealWindDirs)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Ideal Tide:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{spot.idealTide}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Tide Movement:</span>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {getTideMovementDescription(spot.idealTideMovement)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features & Safety */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Features & Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {spot.lifeguarded && (
                  <Badge variant="success" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Lifeguards
                  </Badge>
                )}
                {spot.easyEntry && (
                  <Badge variant="accent" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Easy Entry
                  </Badge>
                )}
                {spot.shortPaddle && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Short Paddle
                  </Badge>
                )}
              </div>
              
              <div>
                <span className="text-muted-foreground text-sm">Paddle Distance:</span>
                <p className="font-medium">{spot.paddleDistance}m</p>
              </div>
              
              {spot.hazards.length > 0 && (
                <div>
                  <span className="text-muted-foreground text-sm flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Hazards:
                  </span>
                  <ul className="text-sm mt-1 space-y-1">
                    {spot.hazards.map((hazard, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-warning rounded-full" />
                        {hazard}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Local Knowledge - Full width */}
        <div className="lg:col-span-3">
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle>Local Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entry & Exit */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Waves className="h-4 w-4 text-accent" />
                    Entry & Exit
                  </h4>
                  <p className="text-sm text-muted-foreground">{spot.entryExitNotes}</p>
                </div>
                
                {/* Seasonality */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Seasonality
                  </h4>
                  <p className="text-sm text-muted-foreground">{spot.seasonality}</p>
                </div>
                
                {/* Parking */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    Parking
                  </h4>
                  <p className="text-sm text-muted-foreground">{spot.parking}</p>
                </div>
                
                {/* Facilities */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Coffee className="h-4 w-4 text-muted-foreground" />
                    Nearby Facilities
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {spot.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Localism */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Localism Level
                  <Badge variant={getLocalismColor(spot.localismLevel) as any} className="capitalize">
                    {spot.localismLevel}
                  </Badge>
                </h4>
                <p className="text-sm text-muted-foreground">{spot.localismNotes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>


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

export default SpotDetailPage;