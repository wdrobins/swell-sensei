export type FitScoreVariant = 'success' | 'accent' | 'warning' | 'destructive';

export function getFitScoreVariant(score: number): FitScoreVariant {
  if (score >= 8) return 'success';
  if (score >= 6) return 'accent';
  if (score >= 4) return 'warning';
  return 'destructive';
}

export function getSpotId(preferences: unknown): string | null {
  if (!preferences || typeof preferences !== 'object') return null;

  const record = preferences as Record<string, unknown>;
  const spotId = record.spotId ?? record.spot_id;
  return typeof spotId === 'string' && spotId.length > 0 ? spotId : null;
}
