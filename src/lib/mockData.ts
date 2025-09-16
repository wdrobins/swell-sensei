// Mock data for Surf Coast VIC spots and user profiles

export interface SurfSpot {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number];
  orientation: number;
  breakType: 'beach' | 'reef' | 'point';
  bottom: string;
  hazards: string[];
  idealSwellDirs: number[];
  idealWindDirs: number[];
  idealTide: 'low' | 'mid' | 'high' | 'any';
  paddleDistance: number;
  entryExitNotes: string;
  seasonality: string;
  lifeguarded: boolean;
  easyEntry: boolean;
  shortPaddle: boolean;
  crowdFactor: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface ForecastData {
  timestamp: string;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  tideLevel: number;
  confidence: number;
}

export interface SurferProfile {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  yearsSurfing: number;
  canDuckDive: boolean;
  comfortableWaveSize: 'waist' | 'shoulder' | 'head' | 'overhead' | 'double-overhead';
  experienceTypes: ('beach' | 'reef' | 'point')[];
  paddleFitness: 'low' | 'medium' | 'high';
  confidence: number; // 1-5
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  homeRadius: number; // km
  favoriteSpots: string[];
  goals: string[];
  injuries: string[];
}

export const surfSpots: SurfSpot[] = [
  {
    id: 'bells-beach',
    name: 'Bells Beach',
    region: 'Surf Coast VIC',
    coordinates: [-38.3739, 144.2834],
    orientation: 210,
    breakType: 'point',
    bottom: 'Rock/Sand',
    hazards: ['Rocks', 'Strong currents', 'Crowds', 'Sweep'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [0, 30, 60, 330],
    idealTide: 'mid',
    paddleDistance: 200,
    entryExitNotes: 'Rocky entry, watch for sweep on big days. Long paddle to lineup.',
    seasonality: 'Best in autumn/winter with SW swells',
    lifeguarded: false,
    easyEntry: false,
    shortPaddle: false,
    crowdFactor: 8,
    skillLevel: 'advanced'
  },
  {
    id: 'winkipop',
    name: 'Winkipop',
    region: 'Surf Coast VIC',
    coordinates: [-38.3756, 144.2845],
    orientation: 220,
    breakType: 'point',
    bottom: 'Rock',
    hazards: ['Rocks', 'Urchins', 'Strong currents'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [30, 60, 90],
    idealTide: 'mid',
    paddleDistance: 150,
    entryExitNotes: 'Rocky platform entry. Expert surfers only on bigger days.',
    seasonality: 'Autumn/winter SW-S swells',
    lifeguarded: false,
    easyEntry: false,
    shortPaddle: true,
    crowdFactor: 6,
    skillLevel: 'expert'
  },
  {
    id: 'jan-juc',
    name: 'Jan Juc',
    region: 'Surf Coast VIC',
    coordinates: [-38.3489, 144.3021],
    orientation: 200,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Rips', 'Crowds on weekends'],
    idealSwellDirs: [180, 210, 240, 270],
    idealWindDirs: [30, 60, 90, 270],
    idealTide: 'any',
    paddleDistance: 100,
    entryExitNotes: 'Sandy beach entry. Multiple peaks along the beach.',
    seasonality: 'Year-round, best with SW-W swells',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 7,
    skillLevel: 'intermediate'
  },
  {
    id: 'thirteenth-beach',
    name: '13th Beach',
    region: 'Surf Coast VIC',
    coordinates: [-38.2567, 144.6234],
    orientation: 180,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Rips', 'Sharks (rare)', 'Remote location'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [270, 300, 330, 0],
    idealTide: 'mid',
    paddleDistance: 80,
    entryExitNotes: 'Multiple peaks, more tolerant of onshore winds. Long beach walk.',
    seasonality: 'Good for onshore days elsewhere',
    lifeguarded: false,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 3,
    skillLevel: 'beginner'
  }
];

export const mockForecast: Record<string, ForecastData[]> = {
  'bells-beach': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.8,
      swellPeriod: 12,
      swellDirection: 225,
      windSpeed: 15,
      windDirection: 45,
      tideLevel: 1.2,
      confidence: 0.85
    }
  ],
  'jan-juc': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.2,
      swellPeriod: 8,
      swellDirection: 210,
      windSpeed: 8,
      windDirection: 60,
      tideLevel: 0.8,
      confidence: 0.90
    }
  ],
  'thirteenth-beach': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 0.9,
      swellPeriod: 10,
      swellDirection: 200,
      windSpeed: 12,
      windDirection: 310,
      tideLevel: 1.0,
      confidence: 0.75
    }
  ],
  'winkipop': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 2.1,
      swellPeriod: 14,
      swellDirection: 220,
      windSpeed: 18,
      windDirection: 70,
      tideLevel: 1.4,
      confidence: 0.80
    }
  ]
};

export const mockSurferProfile: SurferProfile = {
  id: 'user-1',
  name: 'Alex Surfer',
  age: 28,
  height: 175,
  weight: 70,
  yearsSurfing: 8,
  canDuckDive: true,
  comfortableWaveSize: 'head',
  experienceTypes: ['beach', 'point'],
  paddleFitness: 'high',
  confidence: 4,
  riskTolerance: 'moderate',
  homeRadius: 50,
  favoriteSpots: ['jan-juc', 'bells-beach', 'thirteenth-beach'],
  goals: ['Improve tube riding', 'Surf bigger waves', 'Learn to surf reef breaks'],
  injuries: []
};