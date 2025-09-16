import type { ForecastData } from '../mockData'

export interface OpenMeteoMarineData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  hourly_units: {
    time: string
    wave_height: string
    wave_direction: string
    wave_period: string
    wind_wave_height: string
    wind_wave_direction: string
    wind_wave_period: string
    swell_wave_height: string
    swell_wave_direction: string
    swell_wave_period: string
    wind_speed_10m: string
    wind_direction_10m: string
  }
  hourly: {
    time: string[]
    wave_height: number[]
    wave_direction: number[]
    wave_period: number[]
    wind_wave_height: number[]
    wind_wave_direction: number[]
    wind_wave_period: number[]
    swell_wave_height: number[]
    swell_wave_direction: number[]
    swell_wave_period: number[]
    wind_speed_10m: number[]
    wind_direction_10m: number[]
  }
}

export class OpenMeteoProvider {
  private baseUrl = 'https://marine-api.open-meteo.com/v1/marine'

  async getForecast(lat: number, lon: number, hours = 72): Promise<ForecastData[]> {
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        hourly: [
          'wave_height',
          'wave_direction', 
          'wave_period',
          'swell_wave_height',
          'swell_wave_direction',
          'swell_wave_period',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        forecast_days: Math.ceil(hours / 24).toString(),
        timezone: 'Australia/Melbourne'
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`)
      }

      const data: OpenMeteoMarineData = await response.json()
      
      return this.transformData(data)
    } catch (error) {
      console.error('Open-Meteo forecast error:', error)
      return []
    }
  }

  private transformData(data: OpenMeteoMarineData): ForecastData[] {
    const forecasts: ForecastData[] = []
    
    for (let i = 0; i < data.hourly.time.length; i++) {
      // Use swell data if available, otherwise fall back to total wave
      const swellHeight = data.hourly.swell_wave_height[i] ?? data.hourly.wave_height[i] ?? 0
      const swellDirection = data.hourly.swell_wave_direction[i] ?? data.hourly.wave_direction[i] ?? 0
      const swellPeriod = data.hourly.swell_wave_period[i] ?? data.hourly.wave_period[i] ?? 8
      
      forecasts.push({
        timestamp: data.hourly.time[i],
        swellHeight: swellHeight,
        swellPeriod: swellPeriod,
        swellDirection: swellDirection,
        windSpeed: data.hourly.wind_speed_10m[i] ?? 0,
        windDirection: data.hourly.wind_direction_10m[i] ?? 0,
        tideLevel: 1.0, // Open-Meteo doesn't provide tide data - would need separate API
        confidence: 0.8 // Open-Meteo is generally reliable
      })
    }
    
    return forecasts
  }

  // Get current conditions for immediate use
  async getCurrentConditions(lat: number, lon: number): Promise<ForecastData | null> {
    const forecasts = await this.getForecast(lat, lon, 6)
    return forecasts.find(f => new Date(f.timestamp) > new Date()) || null
  }
}