import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SpotCard from '@/components/SpotCard';
import { surfSpots, mockForecast, mockSurferProfile, ForecastData } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { useMultipleSpotForecasts } from '@/hooks/useMarineForecast';
import { Search, Filter, Cloud } from 'lucide-react';

const SpotsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  const filteredSpots = surfSpots.filter(spot => 
    spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spot.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch real forecast data for all spots
  const { data: forecastData, isLoading } = useMultipleSpotForecasts(
    filteredSpots.map(spot => ({
      id: spot.id,
      coordinates: spot.coordinates
    }))
  );

  // Calculate fit scores for each spot using real or mock data
  const spotsWithScores = filteredSpots.map(spot => {
    // Try to get real forecast data first, fallback to mock
    const realForecast = forecastData?.find(f => f.spotId === spot.id);
    
    let forecast: ForecastData | undefined;
    
    if (realForecast?.current) {
      // Convert real API data to ForecastData format
      forecast = {
        timestamp: realForecast.current.timestamp,
        swellHeight: realForecast.current.swellHeight || realForecast.current.waveHeight,
        swellPeriod: realForecast.current.swellPeriod || realForecast.current.wavePeriod,
        swellDirection: realForecast.current.swellDirection || realForecast.current.waveDirection,
        windSpeed: realForecast.current.windSpeed,
        windDirection: realForecast.current.windDirection,
        tideLevel: 1.0, // Open-Meteo doesn't provide tide data
        confidence: 0.85
      };
    } else {
      // Fallback to mock data
      forecast = mockForecast[spot.id]?.[0];
    }
    
    const result = forecast 
      ? calculateFitScore(spot, forecast, mockSurferProfile)
      : null;
    
    return {
      spot,
      fitScore: result?.score,
      fitLabel: result?.label,
      isRealData: !!realForecast
    };
  }).sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0)); // Sort by fit score descending

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Surf Spots
        </h1>
        <p className="text-muted-foreground">
          Find the perfect waves for your skill level and preferences
        </p>
        {forecastData && forecastData.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-success">
            <Cloud className="h-4 w-4" />
            <span>Live forecast data from Open-Meteo</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-float">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search spots by name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                All Levels
              </Badge>
              <Badge variant="success" className="cursor-pointer hover:bg-success/80">
                Beginner Friendly
              </Badge>
              <Badge variant="accent" className="cursor-pointer hover:bg-accent/80">
                Lifeguarded
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spots Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map(spot => (
            <Card key={spot.id} className="shadow-wave">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spotsWithScores.map(({ spot, fitScore, fitLabel }) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              fitScore={fitScore}
              fitLabel={fitLabel}
              showFitScore={true}
            />
          ))}
        </div>
      )}

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No spots found matching your search criteria.
          </p>
        </div>
      )}

      {/* Data Source & Safety Footer */}
      <div className="mt-12 space-y-4">
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-center">
            <strong>Data Source:</strong> Real-time marine forecasts powered by{' '}
            <a 
              href="https://open-meteo.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              Open-Meteo
            </a>
            {' '}(free, open-source weather API)
          </p>
        </div>
        <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning-foreground text-center">
            <strong>Safety Disclaimer:</strong> Conditions change quickly. Local knowledge beats apps. 
            Never surf alone. This tool does not guarantee safety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotsPage;