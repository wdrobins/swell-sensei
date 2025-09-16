import { OpenMeteoProvider } from './open-meteo'
import { BOMProvider, type BOMWarning } from './bom-warnings'
import type { ForecastData, SurfSpot } from '../mockData'

export interface AggregatedForecast extends ForecastData {
  providers: string[]
  warnings: BOMWarning[]
  safetyStatus: {
    safe: boolean
    reasons: string[]
  }
  citations: string[]
}

export class ForecastAggregator {
  private openMeteo = new OpenMeteoProvider()
  private bom = new BOMProvider()

  async getForecastForSpot(spot: SurfSpot, hours = 72): Promise<AggregatedForecast[]> {
    const [lat, lon] = spot.coordinates
    
    try {
      // Get forecasts from all available providers
      const [openMeteoData, bomWarnings, bomTideData] = await Promise.all([
        this.openMeteo.getForecast(lat, lon, hours),
        this.bom.getMarineWarnings(),
        this.bom.getTideData(spot.name)
      ])

      // For now, primarily use Open-Meteo data
      // In production, this would blend multiple providers
      const primaryForecasts = openMeteoData

      // Check safety status
      const safetyStatus = this.bom.isSafeToSurf(bomWarnings)

      // Enhance forecasts with aggregated data
      const aggregatedForecasts: AggregatedForecast[] = primaryForecasts.map(forecast => ({
        ...forecast,
        // Use BOM tide data if available
        tideLevel: bomTideData?.tides.find(tide => 
          Math.abs(new Date(tide.time).getTime() - new Date(forecast.timestamp).getTime()) < 60 * 60 * 1000
        )?.height ?? forecast.tideLevel,
        providers: ['Open-Meteo'],
        warnings: bomWarnings,
        safetyStatus,
        citations: this.generateCitations()
      }))

      return aggregatedForecasts
    } catch (error) {
      console.error('Forecast aggregation error:', error)
      return []
    }
  }

  async getCurrentConditions(spot: SurfSpot): Promise<AggregatedForecast | null> {
    const forecasts = await this.getForecastForSpot(spot, 6)
    return forecasts.find(f => new Date(f.timestamp) > new Date()) || null
  }

  private generateCitations(): string[] {
    const now = new Date()
    return [
      `Marine forecast from Open-Meteo, fetched ${now.toLocaleTimeString()} ${now.toLocaleDateString()}`,
      'Weather warnings from Australian Bureau of Meteorology',
      'Conditions subject to change - always check latest reports before surfing'
    ]
  }

  // Blend multiple forecasts (future implementation)
  private blendForecasts(forecasts: ForecastData[][]): ForecastData[] {
    // Future: Implement weighted blending of multiple providers
    // Priority: Surfline > Swellnet > Open-Meteo > others
    // Cross-validation increases confidence scores
    return forecasts[0] || []
  }

  // Calculate confidence based on provider agreement
  private calculateConfidence(forecasts: ForecastData[]): number {
    // Future: Compare values across providers
    // Higher confidence when providers agree within tolerance
    return 0.8 // Default for single provider
  }
}