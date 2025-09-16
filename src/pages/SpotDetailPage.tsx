import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FitScoreCard from '@/components/FitScoreCard';
import { surfSpots, mockForecast, mockSurferProfile } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { 
  ArrowLeft, MapPin, Waves, Wind, Compass, Clock, 
  AlertTriangle, Users, Shield, CheckCircle2 
} from 'lucide-react';

const SpotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const spot = surfSpots.find(s => s.id === id);
  
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

  const forecast = mockForecast[spot.id]?.[0];
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
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{spot.region}</span>
          <span className="text-xs">•</span>
          <span className="capitalize">{spot.breakType} break</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fit Score - Full width on mobile, spans 2 cols on desktop */}
        <div className="lg:col-span-2">
          {fitResult ? (
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
              <div>
                <span className="text-muted-foreground text-sm">Swell Direction:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Compass className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {spot.idealSwellDirs.join('°, ')}°
                  </span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Wind Direction:</span>
                <div className="flex items-center gap-1 mt-1">
                  <Wind className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {spot.idealWindDirs.join('°, ')}°
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

        {/* Entry/Exit Notes - Full width */}
        <div className="lg:col-span-3">
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle>Local Knowledge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Entry & Exit</h4>
                <p className="text-sm text-muted-foreground">{spot.entryExitNotes}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Seasonality</h4>
                <p className="text-sm text-muted-foreground">{spot.seasonality}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-8">
        <Button size="lg" className="bg-gradient-ocean hover:opacity-90">
          Plan Session Here
        </Button>
        <Button variant="outline" size="lg">
          Add to Favorites
        </Button>
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