import { SurfSpot, ForecastData, SurferProfile } from './mockData';

export interface FitScoreResult {
  score: number;
  label: 'Safe' | 'Manageable' | 'Stretch' | 'No-Go';
  color: 'success' | 'accent' | 'warning' | 'destructive';
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
  
  if (autoNoGo) {
    return {
      score: 0,
      label: 'No-Go',
      color: 'destructive',
      reasoning: ['Unsafe conditions detected'],
      alternatives: [],
      checklist: [],
      coachingTip: 'Safety first - conditions are too dangerous today.',
      bestWindows: [],
      citations: ['Forecast from multiple providers'],
      autoNoGo: true
    };
  }
  
  // Weighted score calculation
  const baseScore = Math.max(0, Math.min(100,
    comfortScore + windScore + tideScore + hazardScore + experienceScore + confidenceBonus
  ));
  
  // Apply confidence damping
  const finalScore = Math.round(baseScore * (0.7 + 0.3 * forecast.confidence));
  
  // Determine label and color
  let label: FitScoreResult['label'];
  let color: FitScoreResult['color'];
  
  if (finalScore >= 80) { label = 'Safe'; color = 'success'; }
  else if (finalScore >= 60) { label = 'Manageable'; color = 'accent'; }
  else if (finalScore >= 40) { label = 'Stretch'; color = 'warning'; }
  else { label = 'No-Go'; color = 'destructive'; }
  
  // Generate reasoning
  const reasoning = [];
  if (comfortScore < 70) reasoning.push(`Wave size (${ews.toFixed(1)}m) outside comfort zone`);
  if (windScore < 0) reasoning.push('Unfavorable wind conditions');
  if (tideScore < 0) reasoning.push('Poor tide timing');
  if (hazardScore < -10) reasoning.push('Significant hazards for skill level');
  if (experienceScore < 0) reasoning.push(`Limited experience with ${spot.breakType} breaks`);
  if (comfortScore >= 80) reasoning.push('Wave size within comfort zone');
  if (windScore > 5) reasoning.push('Favorable offshore winds');
  
  // Generate checklist
  const checklist = [
    `Board: ${ews > 1.5 ? 'Bigger board recommended' : 'Standard board OK'}`,
    `Leash: ${ews > 2.0 ? 'Use backup leash' : 'Regular leash'}`,
    `Entry: ${spot.entryExitNotes}`,
    forecast.windSpeed > 20 ? 'Strong winds - check conditions on arrival' : 'Check surf before entering'
  ];
  
  // Coaching tip
  const coachingTip = profile.goals.length > 0 
    ? `Focus on: ${profile.goals[0].toLowerCase()}. Start with smaller waves to build confidence.`
    : 'Remember to warm up before paddling out and stay relaxed in the water.';
  
  return {
    score: finalScore,
    label,
    color,
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