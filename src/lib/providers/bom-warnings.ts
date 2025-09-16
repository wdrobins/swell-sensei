export interface BOMWarning {
  id: string
  title: string
  description: string
  severity: 'minor' | 'moderate' | 'major' | 'extreme'
  areas: string[]
  issued: string
  expires: string
  type: 'marine' | 'severe_weather' | 'fire' | 'flood'
}

export interface BOMTideData {
  location: string
  nextHigh: { time: string; height: number }
  nextLow: { time: string; height: number }
  tides: Array<{ time: string; height: number; type: 'high' | 'low' }>
}

export class BOMProvider {
  private warningsUrl = 'http://www.bom.gov.au/fwo/IDZ00059.warnings_vic.xml'
  private tideBaseUrl = 'http://www.bom.gov.au/australia/tides'

  async getMarineWarnings(region = 'victoria'): Promise<BOMWarning[]> {
    try {
      // Note: In production, this would need a proxy server to handle CORS
      // For now, we'll return mock data that represents typical BOM warnings
      
      const mockWarnings: BOMWarning[] = []
      
      // Check for typical marine conditions that would generate warnings
      const now = new Date()
      const windSpeed = Math.random() * 40 // Simulate wind conditions
      
      if (windSpeed > 25) {
        mockWarnings.push({
          id: `marine-${now.getTime()}`,
          title: 'Strong Wind Warning',
          description: `Winds averaging 25 to 35 knots with gusts to 45 knots expected. 
                       Seas 2 to 3 metres, occasionally 4 metres in exposed waters.`,
          severity: windSpeed > 35 ? 'major' : 'moderate',
          areas: ['Port Phillip', 'Western Port', 'Central Coast', 'East Gippsland Coast'],
          issued: now.toISOString(),
          expires: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          type: 'marine'
        })
      }

      // Lightning/thunderstorm warning simulation
      if (Math.random() < 0.1) { // 10% chance
        mockWarnings.push({
          id: `severe-${now.getTime()}`,
          title: 'Severe Thunderstorm Warning',
          description: 'Severe thunderstorms likely to produce heavy rainfall and damaging winds. Lightning activity expected.',
          severity: 'major',
          areas: ['Surf Coast', 'Bellarine Peninsula', 'Geelong'],
          issued: now.toISOString(),
          expires: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
          type: 'severe_weather'
        })
      }

      return mockWarnings
    } catch (error) {
      console.error('BOM warnings error:', error)
      return []
    }
  }

  async getTideData(location: string): Promise<BOMTideData | null> {
    try {
      // Mock tide data for Surf Coast locations
      const now = new Date()
      const baseHeight = 1.2
      const tideRange = 0.8
      
      // Simple sinusoidal tide model (12.5 hour cycle)
      const hours = now.getHours() + now.getMinutes() / 60
      const tidePhase = (hours / 12.5) * 2 * Math.PI
      const currentHeight = baseHeight + (tideRange / 2) * Math.sin(tidePhase)
      
      // Calculate next high and low
      const nextHighHours = 12.5 - (hours % 12.5)
      const nextLowHours = 6.25 - ((hours + 6.25) % 12.5)
      
      const nextHigh = new Date(now.getTime() + nextHighHours * 60 * 60 * 1000)
      const nextLow = new Date(now.getTime() + nextLowHours * 60 * 60 * 1000)
      
      return {
        location,
        nextHigh: {
          time: nextHigh.toISOString(),
          height: baseHeight + tideRange / 2
        },
        nextLow: {
          time: nextLow.toISOString(), 
          height: baseHeight - tideRange / 2
        },
        tides: [
          {
            time: nextHigh.toISOString(),
            height: baseHeight + tideRange / 2,
            type: 'high'
          },
          {
            time: nextLow.toISOString(),
            height: baseHeight - tideRange / 2,
            type: 'low'
          }
        ]
      }
    } catch (error) {
      console.error('BOM tide data error:', error)
      return null
    }
  }

  // Check if conditions are safe based on warnings
  isSafeToSurf(warnings: BOMWarning[]): { safe: boolean; reasons: string[] } {
    const reasons: string[] = []
    let safe = true

    for (const warning of warnings) {
      if (warning.type === 'severe_weather' && warning.description.includes('Lightning')) {
        safe = false
        reasons.push('Lightning risk - do not enter water')
      }
      
      if (warning.type === 'marine' && warning.severity === 'major') {
        safe = false
        reasons.push('Dangerous marine conditions')
      }
      
      if (warning.type === 'marine' && warning.severity === 'moderate') {
        reasons.push('Strong wind warning in effect')
      }
    }

    return { safe, reasons }
  }
}