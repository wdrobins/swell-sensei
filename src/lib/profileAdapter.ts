import type { SurferProfile } from './mockData.js';

export type StoredProfile = {
  user_id: string;
  display_name: string | null;
  skill_level: string | null;
  experience_years: number | null;
  preferred_wave_size: string | null;
};

const waveSizes = ['waist', 'shoulder', 'head', 'overhead', 'double-overhead'] as const;
type WaveSize = (typeof waveSizes)[number];

function toWaveSize(value: string | null, skill: string | null): WaveSize {
  const normalised = value?.trim().toLowerCase();
  if (normalised && waveSizes.includes(normalised as WaveSize)) return normalised as WaveSize;

  switch (skill) {
    case 'expert': return 'double-overhead';
    case 'advanced': return 'overhead';
    case 'intermediate': return 'head';
    default: return 'waist';
  }
}

export function isProfileComplete(profile: StoredProfile | null | undefined): boolean {
  return Boolean(
    profile
    && profile.skill_level
    && profile.preferred_wave_size
    && Number.isInteger(profile.experience_years)
    && profile.experience_years >= 0,
  );
}

export function toSurferProfile(profile: StoredProfile | null): SurferProfile {
  const skill = profile?.skill_level ?? 'beginner';
  const experienceTypes = skill === 'expert' || skill === 'advanced'
    ? ['beach', 'reef', 'point'] as const
    : skill === 'intermediate'
      ? ['beach', 'point'] as const
      : ['beach'] as const;

  return {
    id: profile?.user_id ?? 'anonymous',
    name: profile?.display_name?.trim() || 'Surfer',
    age: 0,
    height: 0,
    weight: 0,
    yearsSurfing: Math.max(0, profile?.experience_years ?? 0),
    canDuckDive: skill !== 'beginner',
    comfortableWaveSize: toWaveSize(profile?.preferred_wave_size ?? null, skill),
    experienceTypes: [...experienceTypes],
    paddleFitness: skill === 'expert' || skill === 'advanced' ? 'high' : skill === 'intermediate' ? 'medium' : 'low',
    confidence: skill === 'expert' || skill === 'advanced' ? 4 : skill === 'intermediate' ? 3 : 2,
    riskTolerance: skill === 'expert' || skill === 'advanced' ? 'moderate' : 'conservative',
    homeRadius: 50,
    favoriteSpots: [],
    goals: [],
    injuries: [],
  };
}
