import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FitScoreResult } from '@/lib/fitScoring';
import { AlertTriangle, CheckCircle, Activity, Clock, Shield, Zap } from 'lucide-react';

interface FitScoreCardProps {
  result: FitScoreResult;
  spotName: string;
}

const FitScoreCard: React.FC<FitScoreCardProps> = ({ result, spotName }) => {
  const getScoreIcon = () => {
    switch (result.label) {
      case 'Safe':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'Manageable':
        return <Activity className="h-6 w-6 text-accent" />;
      case 'Stretch':
        return <Clock className="h-6 w-6 text-warning" />;
      case 'No-Go':
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
    }
  };

  const getScoreColor = () => {
    switch (result.color) {
      case 'success': return 'bg-gradient-to-r from-success/20 to-success/10 border-success/30';
      case 'accent': return 'bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30';
      case 'warning': return 'bg-gradient-to-r from-warning/20 to-warning/10 border-warning/30';
      case 'destructive': return 'bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive/30';
    }
  };

  const getExcitementColor = () => {
    switch (result.excitementLabel) {
      case 'Epic': return 'text-primary bg-primary/10 border-primary/30';
      case 'Pumping': return 'text-accent bg-accent/10 border-accent/30';
      case 'Fun': return 'text-success bg-success/10 border-success/30';
      case 'Mellow': return 'text-muted-foreground bg-muted border-muted';
    }
  };

  return (
    <Card className={`shadow-float ${getScoreColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-semibold">{spotName} Fit Score</span>
          {getScoreIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Combined Score Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-foreground">
            {result.score}
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className={`text-${result.color} border-${result.color}/50`}>
              {result.label}
            </Badge>
            <Badge variant="outline" className={getExcitementColor()}>
              {result.excitementLabel}
            </Badge>
          </div>
          <Progress value={result.score} className="w-full h-2" />
        </div>

        {/* Safety & Excitement Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Safety</span>
            </div>
            <div className="text-2xl font-bold text-success">{result.safetyScore}</div>
            <Progress value={result.safetyScore} className="w-full h-1.5 mt-1" />
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase">Excitement</span>
            </div>
            <div className="text-2xl font-bold text-primary">{result.excitementScore}</div>
            <Progress value={result.excitementScore} className="w-full h-1.5 mt-1" />
          </div>
        </div>

        {/* Reasoning */}
        {result.reasoning.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Why this score?
            </h4>
            <ul className="space-y-1 text-sm">
              {result.reasoning.map((reason, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Best Windows */}
        {result.bestWindows.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Best Time Windows
            </h4>
            <div className="space-y-2">
              {result.bestWindows.map((window, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-lg">
                  <div>
                    <span className="font-medium">{window.time}</span>
                    <p className="text-xs text-muted-foreground">{window.conditions}</p>
                  </div>
                  <Badge variant="secondary">{window.score}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Tip */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <h4 className="font-medium text-primary mb-1">Coaching Tip</h4>
          <p className="text-sm text-foreground">{result.coachingTip}</p>
        </div>

        {/* Citations */}
        <div className="text-xs text-muted-foreground border-t pt-2">
          {result.citations.join(' • ')}
        </div>
      </CardContent>
    </Card>
  );
};

export default FitScoreCard;