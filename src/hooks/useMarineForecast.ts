import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchMarineForecast, getCurrentConditions, getDailySummary } from '@/lib/weatherService';

/**
 * Hook to fetch and cache marine forecast data for a specific location
 * Uses React Query for automatic caching and refetching
 */
export function useMarineForecast(latitude: number, longitude: number, enabled = true) {
  return useQuery({
    queryKey: ['marine-forecast', latitude, longitude],
    queryFn: async () => {
      const forecast = await fetchMarineForecast(latitude, longitude);
      if (!forecast) {
        throw new Error('Failed to fetch forecast');
      }
      
      return {
        raw: forecast,
        current: getCurrentConditions(forecast),
        daily: getDailySummary(forecast)
      };
    },
    enabled,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour (formerly cacheTime)
    retry: 2,
  });
}

/**
 * Hook to fetch forecasts for multiple spots
 */
export function useMultipleSpotForecasts(spots: Array<{ id: string; coordinates: [number, number] }>) {
  const queries = useQueries({
    queries: spots.map(spot => ({
      queryKey: ['marine-forecast', spot.coordinates[0], spot.coordinates[1]],
      queryFn: async () => {
        const forecast = await fetchMarineForecast(spot.coordinates[0], spot.coordinates[1]);
        if (!forecast) return null;
        
        return {
          spotId: spot.id,
          current: getCurrentConditions(forecast),
          daily: getDailySummary(forecast)
        };
      },
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      retry: 1,
    })),
  });

  return {
    queries,
    isLoading: queries.some(q => q.isLoading),
    isError: queries.some(q => q.isError),
    data: queries.map(q => q.data).filter(Boolean)
  };
}
