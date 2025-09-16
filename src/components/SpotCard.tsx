import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SurfSpot } from '@/lib/mockData';
import { MapPin, Waves, Wind, Users, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpotCardProps {
  spot: SurfSpot;
  fitScore?: number;
  fitLabel?: string;
  showFitScore?: boolean;
}

const SpotCard: React.FC<SpotCardProps> = ({ spot, fitScore, fitLabel, showFitScore = false }) => {
  const getSkillColor = () => {
    switch (spot.skillLevel) {
      case 'beginner': return 'success';
      case 'intermediate': return 'accent';
      case 'advanced': return 'warning';
      case 'expert': return 'destructive';
      default: return 'secondary';
    }
  };

  const getFitScoreColor = () => {
    if (!fitScore) return 'secondary';
    if (fitScore >= 80) return 'success';
    if (fitScore >= 60) return 'accent';
    if (fitScore >= 40) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="group hover:shadow-wave transition-all duration-300 hover:scale-[1.02] bg-card/80 backdrop-blur-sm border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {spot.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="h-3 w-3" />
              {spot.region}
            </div>
          </div>
          {showFitScore && fitScore !== undefined && (
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{fitScore}</div>
              <Badge variant="outline" className={`text-xs text-${getFitScoreColor()} border-${getFitScoreColor()}/50`}>
                {fitLabel}
              </Badge>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Waves className="h-4 w-4 text-accent" />
            <span className="capitalize">{spot.breakType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-primary" />
            <span>{spot.bottom}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-warning" />
            <span>Crowd: {spot.crowdFactor}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{spot.paddleDistance}m paddle</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={getSkillColor()} className="text-xs">
            {spot.skillLevel}
          </Badge>
          {spot.lifeguarded && (
            <Badge variant="success" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Lifeguards
            </Badge>
          )}
          {spot.easyEntry && (
            <Badge variant="secondary" className="text-xs">
              Easy Entry
            </Badge>
          )}
          {spot.shortPaddle && (
            <Badge variant="secondary" className="text-xs">
              Short Paddle
            </Badge>
          )}
        </div>

        {/* Hazards */}
        {spot.hazards.length > 0 && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Hazards: </span>
            {spot.hazards.join(', ')}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="default" size="sm" className="flex-1">
            <Link to={`/spots/${spot.id}`}>
              View Details
            </Link>
          </Button>
          {showFitScore && (
            <Button variant="outline" size="sm">
              Compare
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotCard;