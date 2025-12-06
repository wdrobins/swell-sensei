import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import SpotCard from '@/components/SpotCard';
import { surfSpots, mockForecast, mockSurferProfile, ForecastData } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import { useMultipleSpotForecasts } from '@/hooks/useMarineForecast';
import { calculateDistance, homeLocations } from '@/lib/compassUtils';
import { Search, Filter, Cloud, MapPin, Navigation } from 'lucide-react';

const SpotsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [homeLocation, setHomeLocation] = React.useState<string>('Melbourne CBD');
  const [maxDistance, setMaxDistance] = React.useState<number>(100);
  const [filterByDistance, setFilterByDistance] = React.useState<boolean>(false);
  const [skillFilter, setSkillFilter] = React.useState<string>('all');
  const [lifeguardedOnly, setLifeguardedOnly] = React.useState<boolean>(false);

  // Get home coordinates
  const homeCoords = homeLocations[homeLocation] || homeLocations['Melbourne CBD'];

  // Fetch real forecast data for ALL spots (must be called unconditionally for React hooks rules)
  const { data: forecastData, isLoading } = useMultipleSpotForecasts(
    surfSpots.map(spot => ({
      id: spot.id,
      coordinates: spot.coordinates
    }))
  );

  // Calculate distances for all spots
  const spotsWithDistance = surfSpots.map(spot => {
    const distance = calculateDistance(
      homeCoords[0], homeCoords[1],
      spot.coordinates[0], spot.coordinates[1]
    );
    return { ...spot, distance };
  });

  // Filter spots based on user preferences
  const filteredSpots = spotsWithDistance.filter(spot => {
    // Search filter
    const matchesSearch = 
      spot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spot.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Distance filter
    const matchesDistance = !filterByDistance || spot.distance <= maxDistance;
    
    // Skill filter
    const matchesSkill = skillFilter === 'all' || spot.skillLevel === skillFilter;
    
    // Lifeguarded filter
    const matchesLifeguard = !lifeguardedOnly || spot.lifeguarded;
    
    return matchesSearch && matchesDistance && matchesSkill && matchesLifeguard;
  });

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
      distance: spot.distance,
      fitScore: result?.score,
      fitLabel: result?.label,
      isRealData: !!realForecast,
      forecast
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
        {isLoading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Cloud className="h-4 w-4 animate-pulse" />
            <span>Loading live forecast data...</span>
          </div>
        )}
        {!isLoading && forecastData && forecastData.length > 0 && (
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
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search spots by name or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Proximity Filter */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-primary" />
                <Label htmlFor="proximity-filter" className="font-medium">Filter by proximity</Label>
              </div>
              <Switch
                id="proximity-filter"
                checked={filterByDistance}
                onCheckedChange={setFilterByDistance}
              />
            </div>
            
            {filterByDistance && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Your location
                    </Label>
                    <Select value={homeLocation} onValueChange={setHomeLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(homeLocations).map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">
                      Max distance: <span className="font-bold text-primary">{maxDistance}km</span>
                    </Label>
                    <Slider
                      value={[maxDistance]}
                      onValueChange={(value) => setMaxDistance(value[0])}
                      min={10}
                      max={200}
                      step={10}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>10km</span>
                      <span>200km</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={skillFilter === 'all' ? 'default' : 'secondary'} 
              className="cursor-pointer hover:opacity-80"
              onClick={() => setSkillFilter('all')}
            >
              All Levels
            </Badge>
            <Badge 
              variant={skillFilter === 'beginner' ? 'success' : 'secondary'} 
              className="cursor-pointer hover:opacity-80"
              onClick={() => setSkillFilter(skillFilter === 'beginner' ? 'all' : 'beginner')}
            >
              Beginner Friendly
            </Badge>
            <Badge 
              variant={skillFilter === 'intermediate' ? 'accent' : 'secondary'} 
              className="cursor-pointer hover:opacity-80"
              onClick={() => setSkillFilter(skillFilter === 'intermediate' ? 'all' : 'intermediate')}
            >
              Intermediate
            </Badge>
            <Badge 
              variant={skillFilter === 'advanced' ? 'warning' : 'secondary'} 
              className="cursor-pointer hover:opacity-80"
              onClick={() => setSkillFilter(skillFilter === 'advanced' ? 'all' : 'advanced')}
            >
              Advanced
            </Badge>
            <Badge 
              variant={lifeguardedOnly ? 'success' : 'secondary'} 
              className="cursor-pointer hover:opacity-80"
              onClick={() => setLifeguardedOnly(!lifeguardedOnly)}
            >
              🏊 Lifeguarded Only
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {spotsWithScores.length} of {surfSpots.length} spots
        {filterByDistance && ` within ${maxDistance}km of ${homeLocation}`}
      </div>

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
          {spotsWithScores.map(({ spot, distance, fitScore, fitLabel, forecast }) => (
            <div key={spot.id} className="relative">
              {filterByDistance && (
                <Badge 
                  variant="outline" 
                  className="absolute top-2 right-2 z-10 bg-background/90 backdrop-blur-sm"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {Math.round(distance)}km
                </Badge>
              )}
              <SpotCard
                spot={spot}
                fitScore={fitScore}
                fitLabel={fitLabel}
                showFitScore={true}
                forecast={forecast}
              />
            </div>
          ))}
        </div>
      )}

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No spots found matching your criteria.
            {filterByDistance && ' Try increasing your max distance.'}
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