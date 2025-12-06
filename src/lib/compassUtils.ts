/**
 * Convert degrees to compass point
 */
export function degreesToCompass(degrees: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW'
  ];
  
  // Normalize degrees to 0-360
  const normalized = ((degrees % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  
  return directions[index];
}

/**
 * Convert array of degrees to compass points string
 */
export function degreesArrayToCompass(degrees: number[]): string {
  const compassPoints = degrees.map(degreesToCompass);
  // Remove duplicates and join
  const unique = [...new Set(compassPoints)];
  return unique.join(', ');
}

/**
 * Get tide movement description
 */
export function getTideMovementDescription(movement: 'incoming' | 'outgoing' | 'slack' | 'any'): string {
  const descriptions: Record<string, string> = {
    incoming: 'Rising tide (pushing in)',
    outgoing: 'Dropping tide (pulling out)',
    slack: 'Slack tide (high or low)',
    any: 'Works on all tides'
  };
  return descriptions[movement] || movement;
}

/**
 * Get localism level color
 */
export function getLocalismColor(level: 'friendly' | 'moderate' | 'heavy'): string {
  const colors: Record<string, string> = {
    friendly: 'success',
    moderate: 'warning',
    heavy: 'destructive'
  };
  return colors[level] || 'secondary';
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Home location coordinates for Victorian surf spots
 * In production, this would come from user profile/geocoding
 */
export const homeLocations: Record<string, [number, number]> = {
  'Melbourne CBD': [-37.8136, 144.9631],
  'Geelong': [-38.1499, 144.3617],
  'Torquay': [-38.3300, 144.3260],
  'Ocean Grove': [-38.2636, 144.5186],
  'Ballarat': [-37.5622, 143.8503],
  'Werribee': [-37.9000, 144.6667],
  'Frankston': [-38.1500, 145.1260]
};
