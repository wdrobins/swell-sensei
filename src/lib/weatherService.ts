// Open-Meteo Marine Weather API Service
// Free, no API key required

export interface MarineWeatherData {
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
  wind_wave_height: number[];
  wind_wave_direction: number[];
  wind_wave_period: number[];
  swell_wave_height: number[];
  swell_wave_direction: number[];
  swell_wave_period: number[];
}

export interface WeatherData {
  temperature_2m: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
}

export interface ForecastResponse {
  marine: MarineWeatherData;
  weather: WeatherData;
  time: string[];
}

/**
 * Fetch marine weather forecast from Open-Meteo API (no API key required)
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Marine and weather forecast data
 */
export async function fetchMarineForecast(
  latitude: number,
  longitude: number
): Promise<ForecastResponse | null> {
  try {
    // Marine Weather API - wave forecasts
    const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&timezone=auto&forecast_days=7`;
    
    // Weather API - wind and temperature
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kn&timezone=auto&forecast_days=7`;

    const [marineResponse, weatherResponse] = await Promise.all([
      fetch(marineUrl),
      fetch(weatherUrl)
    ]);

    if (!marineResponse.ok || !weatherResponse.ok) {
      console.error('Failed to fetch weather data');
      return null;
    }

    const marineData = await marineResponse.json();
    const weatherData = await weatherResponse.json();

    return {
      marine: marineData.hourly,
      weather: weatherData.hourly,
      time: marineData.hourly.time
    };
  } catch (error) {
    console.error('Error fetching marine forecast:', error);
    return null;
  }
}

/**
 * Get current conditions (first hour of forecast)
 */
export function getCurrentConditions(forecast: ForecastResponse) {
  if (!forecast || !forecast.marine || !forecast.weather) {
    return null;
  }

  return {
    waveHeight: forecast.marine.wave_height[0],
    waveDirection: forecast.marine.wave_direction[0],
    wavePeriod: forecast.marine.wave_period[0],
    swellHeight: forecast.marine.swell_wave_height[0],
    swellDirection: forecast.marine.swell_wave_direction[0],
    swellPeriod: forecast.marine.swell_wave_period[0],
    windSpeed: forecast.weather.wind_speed_10m[0],
    windDirection: forecast.weather.wind_direction_10m[0],
    temperature: forecast.weather.temperature_2m[0],
    timestamp: forecast.time[0]
  };
}

/**
 * Get daily summary (average conditions for each day)
 */
export function getDailySummary(forecast: ForecastResponse) {
  if (!forecast || !forecast.marine || !forecast.weather) {
    return [];
  }

  const dailySummaries = [];
  const hoursPerDay = 24;
  const totalDays = Math.floor(forecast.time.length / hoursPerDay);

  for (let day = 0; day < totalDays; day++) {
    const startIdx = day * hoursPerDay;
    const endIdx = startIdx + hoursPerDay;

    // Get daytime hours (6am to 6pm) for better averages
    const daytimeStart = startIdx + 6;
    const daytimeEnd = startIdx + 18;

    const daytimeIndices = Array.from(
      { length: daytimeEnd - daytimeStart },
      (_, i) => daytimeStart + i
    );

    const avgWaveHeight =
      daytimeIndices.reduce((sum, i) => sum + (forecast.marine.wave_height[i] || 0), 0) /
      daytimeIndices.length;

    const avgSwellHeight =
      daytimeIndices.reduce((sum, i) => sum + (forecast.marine.swell_wave_height[i] || 0), 0) /
      daytimeIndices.length;

    const avgSwellPeriod =
      daytimeIndices.reduce((sum, i) => sum + (forecast.marine.swell_wave_period[i] || 0), 0) /
      daytimeIndices.length;

    const avgWindSpeed =
      daytimeIndices.reduce((sum, i) => sum + (forecast.weather.wind_speed_10m[i] || 0), 0) /
      daytimeIndices.length;

    const avgWindDirection =
      daytimeIndices.reduce((sum, i) => sum + (forecast.weather.wind_direction_10m[i] || 0), 0) /
      daytimeIndices.length;

    const avgSwellDirection =
      daytimeIndices.reduce((sum, i) => sum + (forecast.marine.swell_wave_direction[i] || 0), 0) /
      daytimeIndices.length;

    dailySummaries.push({
      date: forecast.time[startIdx],
      waveHeight: avgWaveHeight,
      swellHeight: avgSwellHeight,
      swellPeriod: avgSwellPeriod,
      swellDirection: avgSwellDirection,
      windSpeed: avgWindSpeed,
      windDirection: avgWindDirection,
      maxWaveHeight: Math.max(...daytimeIndices.map(i => forecast.marine.wave_height[i] || 0)),
      minWaveHeight: Math.min(...daytimeIndices.map(i => forecast.marine.wave_height[i] || 0))
    });
  }

  return dailySummaries;
}

/**
 * Convert wave height from meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters * 3.28084;
}

/**
 * Get wind direction as compass point (N, NE, E, etc.)
 */
export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Format wave height for display (e.g., "1-2ft" or "2-3m")
 */
export function formatWaveHeight(heightMeters: number, unit: 'ft' | 'm' = 'ft'): string {
  if (unit === 'ft') {
    const feet = metersToFeet(heightMeters);
    const lower = Math.floor(feet);
    const upper = Math.ceil(feet);
    return lower === upper ? `${lower}ft` : `${lower}-${upper}ft`;
  } else {
    const rounded = Math.round(heightMeters * 10) / 10;
    return `${rounded}m`;
  }
}
