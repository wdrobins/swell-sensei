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
  },
  {
    id: 'torquay-front-beach',
    name: 'Torquay Front Beach',
    region: 'Surf Coast VIC',
    coordinates: [-38.3345, 144.3201],
    orientation: 190,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Crowds in summer', 'Rips near groynes'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [270, 300, 330, 0, 30],
    idealTide: 'any',
    paddleDistance: 60,
    entryExitNotes: 'Easy beach entry near surf clubs. Protected bay location.',
    seasonality: 'Year-round, sheltered spot',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 8,
    skillLevel: 'beginner'
  },
  {
    id: 'point-addis',
    name: 'Point Addis',
    region: 'Surf Coast VIC',
    coordinates: [-38.3912, 144.2567],
    orientation: 200,
    breakType: 'reef',
    bottom: 'Rock/Reef',
    hazards: ['Rocks', 'Long paddle', 'Strong currents', 'Urchins'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [0, 30, 60, 90],
    idealTide: 'mid',
    paddleDistance: 250,
    entryExitNotes: 'Rocky entry down cliff. Very long paddle. Check conditions carefully.',
    seasonality: 'Best in autumn/winter',
    lifeguarded: false,
    easyEntry: false,
    shortPaddle: false,
    crowdFactor: 4,
    skillLevel: 'advanced'
  },
  {
    id: 'anglesea',
    name: 'Anglesea',
    region: 'Surf Coast VIC',
    coordinates: [-38.4078, 144.1890],
    orientation: 205,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Rips near river mouth', 'Crowds on weekends'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [270, 300, 330, 0, 30],
    idealTide: 'any',
    paddleDistance: 90,
    entryExitNotes: 'Sandy beach entry. Multiple peaks. River mouth can affect sandbars.',
    seasonality: 'Year-round',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 7,
    skillLevel: 'intermediate'
  },
  {
    id: 'fairhaven',
    name: 'Fairhaven',
    region: 'Surf Coast VIC',
    coordinates: [-38.4589, 144.0234],
    orientation: 210,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Rips', 'Remote location'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [270, 300, 330, 0, 30],
    idealTide: 'any',
    paddleDistance: 70,
    entryExitNotes: 'Beautiful sandy beach. Easy entry. Less crowded than nearby spots.',
    seasonality: 'Year-round',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 4,
    skillLevel: 'beginner'
  },
  {
    id: 'lorne',
    name: 'Lorne',
    region: 'Surf Coast VIC',
    coordinates: [-38.5445, 143.9789],
    orientation: 220,
    breakType: 'beach',
    bottom: 'Sand/Rock',
    hazards: ['Rocks at ends', 'Strong rips', 'Crowds in summer'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [270, 300, 330, 0, 30],
    idealTide: 'mid',
    paddleDistance: 100,
    entryExitNotes: 'Beach entry. Multiple peaks. Can get hollow on bigger swells.',
    seasonality: 'Year-round, best in winter',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 6,
    skillLevel: 'intermediate'
  },
  {
    id: 'johanna',
    name: 'Johanna Beach',
    region: 'Great Ocean Road VIC',
    coordinates: [-38.7534, 143.3912],
    orientation: 230,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Powerful waves', 'Strong rips', 'Cold water', 'Remote location', 'Sharks'],
    idealSwellDirs: [180, 210, 240, 270],
    idealWindDirs: [270, 300, 330, 0, 30, 60, 90],
    idealTide: 'any',
    paddleDistance: 120,
    entryExitNotes: 'Exposed beach. Very powerful waves. For experienced surfers only.',
    seasonality: 'Year-round, often big',
    lifeguarded: false,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 2,
    skillLevel: 'advanced'
  },
  {
    id: 'ocean-grove',
    name: 'Ocean Grove',
    region: 'Bellarine Peninsula VIC',
    coordinates: [-38.2678, 144.5234],
    orientation: 170,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['Rips', 'Summer crowds'],
    idealSwellDirs: [150, 180, 210],
    idealWindDirs: [270, 300, 330, 0],
    idealTide: 'any',
    paddleDistance: 60,
    entryExitNotes: 'Easy sandy beach entry. Family-friendly. Protected from W winds.',
    seasonality: 'Year-round',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 6,
    skillLevel: 'beginner'
  },
  {
    id: 'barwon-heads',
    name: 'Barwon Heads',
    region: 'Bellarine Peninsula VIC',
    coordinates: [-38.2789, 144.4956],
    orientation: 175,
    breakType: 'beach',
    bottom: 'Sand',
    hazards: ['River mouth currents', 'Rips', 'Crowds'],
    idealSwellDirs: [150, 180, 210],
    idealWindDirs: [270, 300, 330, 0],
    idealTide: 'mid',
    paddleDistance: 80,
    entryExitNotes: 'Sandy beach. River mouth affects conditions. Good for learners.',
    seasonality: 'Year-round, smaller waves',
    lifeguarded: true,
    easyEntry: true,
    shortPaddle: true,
    crowdFactor: 7,
    skillLevel: 'beginner'
  },
  {
    id: 'winki-pop-inside',
    name: 'Winki Pop Inside',
    region: 'Surf Coast VIC',
    coordinates: [-38.3761, 144.2848],
    orientation: 215,
    breakType: 'reef',
    bottom: 'Rock/Reef',
    hazards: ['Rocks', 'Urchins', 'Crowds'],
    idealSwellDirs: [180, 210, 240],
    idealWindDirs: [30, 60, 90],
    idealTide: 'mid',
    paddleDistance: 120,
    entryExitNotes: 'Rocky entry. Shorter ride than outer Winki. Still requires skill.',
    seasonality: 'Autumn/winter',
    lifeguarded: false,
    easyEntry: false,
    shortPaddle: true,
    crowdFactor: 7,
    skillLevel: 'advanced'
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
  ],
  'torquay-front-beach': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.0,
      swellPeriod: 9,
      swellDirection: 205,
      windSpeed: 10,
      windDirection: 320,
      tideLevel: 0.9,
      confidence: 0.88
    }
  ],
  'point-addis': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.9,
      swellPeriod: 13,
      swellDirection: 215,
      windSpeed: 12,
      windDirection: 45,
      tideLevel: 1.3,
      confidence: 0.82
    }
  ],
  'anglesea': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.3,
      swellPeriod: 10,
      swellDirection: 210,
      windSpeed: 9,
      windDirection: 300,
      tideLevel: 1.0,
      confidence: 0.85
    }
  ],
  'fairhaven': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.1,
      swellPeriod: 9,
      swellDirection: 215,
      windSpeed: 8,
      windDirection: 310,
      tideLevel: 0.8,
      confidence: 0.87
    }
  ],
  'lorne': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 1.5,
      swellPeriod: 11,
      swellDirection: 220,
      windSpeed: 11,
      windDirection: 300,
      tideLevel: 1.1,
      confidence: 0.83
    }
  ],
  'johanna': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 2.5,
      swellPeriod: 15,
      swellDirection: 235,
      windSpeed: 20,
      windDirection: 330,
      tideLevel: 1.5,
      confidence: 0.78
    }
  ],
  'ocean-grove': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 0.8,
      swellPeriod: 8,
      swellDirection: 180,
      windSpeed: 7,
      windDirection: 290,
      tideLevel: 0.7,
      confidence: 0.90
    }
  ],
  'barwon-heads': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 0.9,
      swellPeriod: 8,
      swellDirection: 185,
      windSpeed: 8,
      windDirection: 300,
      tideLevel: 0.8,
      confidence: 0.88
    }
  ],
  'winki-pop-inside': [
    {
      timestamp: new Date().toISOString(),
      swellHeight: 2.0,
      swellPeriod: 13,
      swellDirection: 218,
      windSpeed: 16,
      windDirection: 65,
      tideLevel: 1.3,
      confidence: 0.81
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