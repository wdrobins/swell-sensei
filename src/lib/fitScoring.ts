import { SurfSpot, ForecastData, SurferProfile } from './mockData';

export interface FitScoreResult {
  score: number;
  safetyScore: number;
  excitementScore: number;
  label: 'Safe' | 'Manageable' | 'Stretch' | 'No-Go';
  color: 'success' | 'accent' | 'warning' | 'destructive';
  excitementLabel: 'Mellow' | 'Fun' | 'Pumping' | 'Epic';
  reasoning: string[];
  alternatives: string[];
  checklist: string[];
  coachingTip: string;
  bestWindows: TimeWindow[];
  citations: string[];
  autoNoGo: boolean;
}

export interface TimeWindow {
  time: string;
  score: number;
  conditions: string;
}

export interface ScoringWeights {
  waveSize: number;
  wind: number;
  tide: number;
  hazards: number;
  experience: number;
  confidence: number;
}

const defaultWeights: ScoringWeights = {
  waveSize: 0.35,
  wind: 0.25,
  tide: 0.15,
  hazards: 0.10,
  experience: 0.10,
  confidence: 0.05
};

/**
 * Calculate Effective Wave Size (EWS) from swell height and period
 */
function calculateEffectiveWaveSize(swellHeight: number, swellPeriod: number): number {
  return Math.min(swellHeight * Math.sqrt(Math.max(swellPeriod, 8) / 12), 4.5);
}

/**
 * Map user comfort level to wave size in meters
 */
function getComfortWaveSize(comfortLevel: string): number {
  const mapping = {
    'waist': 0.6,
    'shoulder': 1.0,
    'head': 1.5,
    'overhead': 2.2,
    'double-overhead': 3.5
  };
  return mapping[comfortLevel as keyof typeof mapping] || 1.0;
}

/**
 * Calculate comfort envelope score based on wave size vs user comfort
 */
function calculateComfortScore(ews: number, profile: SurferProfile): number {
  const comfortSize = getComfortWaveSize(profile.comfortableWaveSize);
  const ratio = ews / comfortSize;
  
  // Perfect score at comfort level
  if (ratio <= 1.0) return 100;
  
  // Gradual falloff outside comfort zone
  if (ratio <= 1.3) return 85 - (ratio - 1.0) * 50; // 85-70 range
  if (ratio <= 1.6) return 70 - (ratio - 1.3) * 70; // 70-49 range
  if (ratio <= 2.0) return 49 - (ratio - 1.6) * 60; // 49-25 range
  
  // Bonus for progression goals if moderate+ risk tolerance
  const progressBonus = profile.goals.some(g => 
    g.toLowerCase().includes('bigger') || g.toLowerCase().includes('progress')
  ) && profile.riskTolerance !== 'conservative' ? 15 : 0;
  
  return Math.max(25 - (ratio - 2.0) * 30 + progressBonus, 0);
}

/**
 * Calculate wind factor score
 */
function calculateWindScore(windSpeed: number, windDir: number, spot: SurfSpot): number {
  const isOffshore = spot.idealWindDirs.some(ideal => 
    Math.abs(windDir - ideal) <= 45 || Math.abs(windDir - ideal) >= 315
  );
  
  // Auto no-go for very strong onshore
  if (!isOffshore && windSpeed > 30) return -100;
  
  if (isOffshore) {
    if (windSpeed <= 15) return 10;
    if (windSpeed <= 25) return 5;
    return 0;
  } else {
    // Cross/onshore penalty
    if (windSpeed <= 10) return -5;
    if (windSpeed <= 20) return -15;
    if (windSpeed <= 30) return -25;
    return -30;
  }
}

/**
 * Calculate tide alignment score
 */
function calculateTideScore(tideLevel: number, spot: SurfSpot): number {
  const ideal = spot.idealTide;
  
  if (ideal === 'any') return 5;
  
  // Simplified tide scoring (would need actual tide chart data in production)
  if (ideal === 'low' && tideLevel < 0.8) return 10;
  if (ideal === 'mid' && tideLevel >= 0.8 && tideLevel <= 1.4) return 10;
  if (ideal === 'high' && tideLevel > 1.4) return 10;
  
  return -10; // Wrong tide
}

/**
 * Calculate hazard and access penalty
 */
function calculateHazardScore(spot: SurfSpot, profile: SurferProfile): number {
  let penalty = 0;
  
  // Major hazards for skill level
  if (spot.hazards.includes('Rocks') && !profile.experienceTypes.includes('reef')) {
    penalty -= 15;
  }
  
  if (spot.hazards.includes('Strong currents') && profile.paddleFitness === 'low') {
    penalty -= 20;
  }
  
  if (spot.hazards.includes('Crowds') && profile.confidence < 3) {
    penalty -= 10;
  }
  
  // Access preferences
  if (!spot.easyEntry && profile.injuries.length > 0) penalty -= 10;
  if (!spot.shortPaddle && profile.paddleFitness === 'low') penalty -= 15;
  
  return Math.max(penalty, -25);
}

/**
 * Calculate experience match bonus
 */
function calculateExperienceScore(spot: SurfSpot, profile: SurferProfile): number {
  if (profile.experienceTypes.includes(spot.breakType)) return 5;
  if (spot.breakType === 'beach') return 0; // Neutral for beaches
  return -10; // Penalty for unfamiliar break types
}

/**
 * Calculate excitement score based on wave quality and conditions
 */
function calculateExcitementScore(
  spot: SurfSpot,
  forecast: ForecastData,
  profile: SurferProfile,
  ews: number
): number {
  let excitement = 0;
  
  // Wave size relative to preference - bigger is more exciting (up to a point)
  const comfortSize = getComfortWaveSize(profile.comfortableWaveSize);
  const sizeRatio = ews / comfortSize;
  
  if (sizeRatio >= 0.7 && sizeRatio <= 1.0) {
    excitement += 50; // Sweet spot
  } else if (sizeRatio > 1.0 && sizeRatio <= 1.5) {
    excitement += 70; // Pushing limits = more exciting
  } else if (sizeRatio > 1.5 && sizeRatio <= 2.0) {
    excitement += 90; // Challenge mode
  } else if (sizeRatio > 2.0) {
    excitement += 100; // Maximum stoke
  } else {
    excitement += sizeRatio * 50; // Smaller waves = less exciting
  }
  
  // Swell period quality - longer periods = better waves
  if (forecast.swellPeriod >= 14) {
    excitement += 15; // Ground swell bonus
  } else if (forecast.swellPeriod >= 10) {
    excitement += 8;
  } else {
    excitement -= 5; // Windswept penalty
  }
  
  // Wind conditions affect wave quality
  const isOffshore = spot.idealWindDirs.some(ideal => 
    Math.abs(forecast.windDirection - ideal) <= 45 || Math.abs(forecast.windDirection - ideal) >= 315
  );
  
  if (isOffshore && forecast.windSpeed <= 15) {
    excitement += 20; // Clean conditions
  } else if (isOffshore) {
    excitement += 10;
  } else if (forecast.windSpeed <= 8) {
    excitement += 5; // Light winds OK
  } else {
    excitement -= 10; // Choppy conditions
  }
  
  // Break type excitement factor
  const breakExcitement: Record<string, number> = {
    'point': 15,
    'reef': 12,
    'beach': 5
  };
  excitement += breakExcitement[spot.breakType] || 5;
  
  // Risk tolerance affects excitement perception
  if (profile.riskTolerance === 'aggressive') {
    excitement += 10; // Thrill seekers get more stoked
  } else if (profile.riskTolerance === 'conservative') {
    excitement -= 5; // More cautious approach
  }
  
  // Goals boost - if conditions match goals
  if (profile.goals.some(g => g.toLowerCase().includes('bigger waves')) && sizeRatio > 1.0) {
    excitement += 15;
  }
  if (profile.goals.some(g => g.toLowerCase().includes('barrel')) && spot.breakType === 'reef') {
    excitement += 15;
  }
  if (profile.goals.some(g => g.toLowerCase().includes('air') || g.toLowerCase().includes('performance'))) {
    // Airs need clean conditions and good size
    if (isOffshore && sizeRatio >= 0.8 && sizeRatio <= 1.3) {
      excitement += 15;
    }
  }
  
  return Math.min(Math.max(excitement, 0), 100);
}

/**
 * Get excitement label based on score
 */
function getExcitementLabel(score: number): FitScoreResult['excitementLabel'] {
  if (score >= 80) return 'Epic';
  if (score >= 60) return 'Pumping';
  if (score >= 40) return 'Fun';
  return 'Mellow';
}

/**
 * Generate spot-specific coaching tip based on conditions, spot characteristics, and local knowledge
 */
function generateSpotCoachingTip(
  spot: SurfSpot,
  forecast: ForecastData,
  profile: SurferProfile,
  ews: number,
  safetyScore: number,
  excitementScore: number
): string {
  // Priority 1: Safety concerns override everything
  if (safetyScore < 40) {
    if (spot.hazards.includes('Strong currents')) {
      return `Strong currents at ${spot.name} - paddle parallel to shore if swept out.`;
    }
    if (spot.hazards.includes('Rocks') || spot.hazards.includes('Urchins')) {
      return `Watch the rocks at ${spot.name}. ${spot.entryExitNotes || 'Wear booties and take care on entry.'}`;
    }
    if (forecast.windSpeed > 25) {
      return `${Math.round(forecast.windSpeed)}kt winds making it challenging. Consider waiting or finding shelter.`;
    }
    return `Challenging conditions at ${spot.name} today. Know your limits.`;
  }

  // Priority 2: Use actual local knowledge from the spot data
  // Different spots get different tips based on their unique characteristics
  
  // For spots with heavy localism - always mention this
  if (spot.localismLevel === 'heavy' && spot.localismNotes) {
    return spot.localismNotes;
  }
  
  // For spots with tricky entry
  if (!spot.easyEntry && spot.entryExitNotes) {
    return spot.entryExitNotes;
  }
  
  // For crowded spots
  if (spot.crowdFactor >= 8) {
    return `${spot.name} gets busy. ${spot.localismNotes || 'Arrive early for the best waves and respect the pecking order.'}`;
  }
  
  // For long paddle spots
  if (spot.paddleDistance > 150) {
    return `${spot.paddleDistance}m paddle to the lineup at ${spot.name}. Pace yourself.`;
  }
  
  // For remote/uncrowded spots
  if (spot.crowdFactor <= 3) {
    return `${spot.name} is uncrowded - enjoy the space but always surf with a buddy in remote spots.`;
  }
  
  // Use moderate localism notes if available
  if (spot.localismLevel === 'moderate' && spot.localismNotes) {
    return spot.localismNotes;
  }
  
  // Break-type specific tips
  if (spot.breakType === 'point') {
    return `Point break at ${spot.name} - position at the top and wait for sets to wrap around.`;
  }
  
  if (spot.breakType === 'reef') {
    return `Reef break at ${spot.name} - know the takeoff zone and watch for shallow sections.`;
  }
  
  // Hazard-specific tips for beach breaks
  if (spot.hazards.includes('Rips')) {
    return `Watch for rips at ${spot.name}. Use the channels to paddle out easier.`;
  }
  
  // For beginner-friendly spots
  if (spot.skillLevel === 'beginner' && spot.easyEntry) {
    return `${spot.name} is great for all levels. ${spot.lifeguarded ? 'Lifeguards on duty for peace of mind.' : 'Take care and know the conditions.'}`;
  }
  
  // Friendly localism spots - use their notes
  if (spot.localismLevel === 'friendly' && spot.localismNotes) {
    return spot.localismNotes;
  }
  
  // Final fallback - use entry/exit notes or a unique identifier
  if (spot.entryExitNotes) {
    return spot.entryExitNotes;
  }
  
  // Generic but with spot name for differentiation
  return `${spot.name}: ${spot.breakType} break with ${spot.bottom.toLowerCase()} bottom. ${spot.easyEntry ? 'Easy entry.' : 'Take care on entry.'}`;
}

/**
 * Main fit scoring function
 */
export function calculateFitScore(
  spot: SurfSpot, 
  forecast: ForecastData, 
  profile: SurferProfile,
  weights: ScoringWeights = defaultWeights
): FitScoreResult {
  const ews = calculateEffectiveWaveSize(forecast.swellHeight, forecast.swellPeriod);
  
  // Individual component scores
  const comfortScore = calculateComfortScore(ews, profile);
  const windScore = calculateWindScore(forecast.windSpeed, forecast.windDirection, spot);
  const tideScore = calculateTideScore(forecast.tideLevel, spot);
  const hazardScore = calculateHazardScore(spot, profile);
  const experienceScore = calculateExperienceScore(spot, profile);
  const confidenceBonus = (profile.confidence - 3) * 2; // -4 to +4
  
  // Check for auto no-go conditions
  const autoNoGo = windScore === -100 || 
    (ews > 2.3 && forecast.swellPeriod > 16 && spot.breakType === 'beach' && profile.riskTolerance === 'conservative');
  
  // Calculate excitement score
  const excitementScore = autoNoGo ? 0 : calculateExcitementScore(spot, forecast, profile, ews);
  
  if (autoNoGo) {
    return {
      score: 0,
      safetyScore: 0,
      excitementScore: 0,
      label: 'No-Go',
      color: 'destructive',
      excitementLabel: 'Mellow',
      reasoning: ['Unsafe conditions detected'],
      alternatives: [],
      checklist: [],
      coachingTip: 'Safety first - conditions are too dangerous today.',
      bestWindows: [],
      citations: ['Forecast from multiple providers'],
      autoNoGo: true
    };
  }
  
  // Weighted score calculation for safety
  const safetyScore = Math.max(0, Math.min(100,
    comfortScore + windScore + tideScore + hazardScore + experienceScore + confidenceBonus
  ));
  
  // Apply confidence damping to safety score
  const dampedSafetyScore = Math.round(safetyScore * (0.7 + 0.3 * forecast.confidence));
  
  // Combined score balances safety (60%) and excitement (40%)
  const finalScore = Math.round(dampedSafetyScore * 0.6 + excitementScore * 0.4);
  
  // Determine label and color based on safety score
  let label: FitScoreResult['label'];
  let color: FitScoreResult['color'];
  
  if (dampedSafetyScore >= 80) { label = 'Safe'; color = 'success'; }
  else if (dampedSafetyScore >= 60) { label = 'Manageable'; color = 'accent'; }
  else if (dampedSafetyScore >= 40) { label = 'Stretch'; color = 'warning'; }
  else { label = 'No-Go'; color = 'destructive'; }
  
  const excitementLabel = getExcitementLabel(excitementScore);
  
  // Generate reasoning
  const reasoning = [];
  if (comfortScore < 70) reasoning.push(`Wave size (${ews.toFixed(1)}m) outside comfort zone`);
  if (windScore < 0) reasoning.push('Unfavorable wind conditions');
  if (tideScore < 0) reasoning.push('Poor tide timing');
  if (hazardScore < -10) reasoning.push('Significant hazards for skill level');
  if (experienceScore < 0) reasoning.push(`Limited experience with ${spot.breakType} breaks`);
  if (comfortScore >= 80) reasoning.push('Wave size within comfort zone');
  if (windScore > 5) reasoning.push('Favorable offshore winds');
  if (excitementScore >= 70) reasoning.push('Excellent wave quality for progression');
  if (excitementScore >= 90) reasoning.push('Epic conditions - don\'t miss it!');
  
  // Generate checklist
  const checklist = [
    `Board: ${ews > 1.5 ? 'Bigger board recommended' : 'Standard board OK'}`,
    `Leash: ${ews > 2.0 ? 'Use backup leash' : 'Regular leash'}`,
    `Entry: ${spot.entryExitNotes}`,
    forecast.windSpeed > 20 ? 'Strong winds - check conditions on arrival' : 'Check surf before entering'
  ];
  
  // Generate spot-specific coaching tip
  const coachingTip = generateSpotCoachingTip(spot, forecast, profile, ews, dampedSafetyScore, excitementScore);
  
  return {
    score: finalScore,
    safetyScore: dampedSafetyScore,
    excitementScore: Math.round(excitementScore),
    label,
    color,
    excitementLabel,
    reasoning,
    alternatives: [], // Would be populated with nearby spots in production
    checklist,
    coachingTip,
    bestWindows: [
      { time: 'Dawn (6-8am)', score: finalScore + 5, conditions: 'Lighter winds' },
      { time: 'Morning (8-10am)', score: finalScore, conditions: 'Current conditions' },
      { time: 'Afternoon (2-4pm)', score: Math.max(finalScore - 15, 0), conditions: 'Stronger winds expected' }
    ],
    citations: [`Forecast from Surfline & Windy, fetched ${new Date().toLocaleTimeString()} local`],
    autoNoGo: false
  };
}