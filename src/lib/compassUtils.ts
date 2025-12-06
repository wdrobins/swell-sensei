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
