import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Users, Waves, ExternalLink } from 'lucide-react'

interface WavePool {
  id: string
  name: string
  location: string
  coordinates: number[]
  schedule: Array<{
    time: string
    sessionType: string
    skillLevel: string
    available: boolean
    price?: number
  }>
  features: string[]
  website?: string
}

interface WavePoolCardProps {
  wavePool: WavePool
  onBookSession?: (poolId: string, sessionTime: string) => void
}

export default function WavePoolCard({ wavePool, onBookSession }: WavePoolCardProps) {
  const nextAvailableSession = wavePool.schedule.find(session => session.available)
  const todaysSchedule = wavePool.schedule.slice(0, 6) // Show next 6 sessions

  return (
    <Card className="shadow-wave">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-primary" />
              {wavePool.name}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {wavePool.location}
            </div>
          </div>
          {wavePool.website && (
            <Button variant="ghost" size="sm" asChild>
              <a href={wavePool.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {wavePool.features.map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        {/* Next Available Session */}
        {nextAvailableSession && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Next Available Session</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {nextAvailableSession.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {nextAvailableSession.skillLevel}
                  </span>
                  <Badge variant="accent" className="text-xs">
                    {nextAvailableSession.sessionType}
                  </Badge>
                </div>
              </div>
              {nextAvailableSession.price && (
                <div className="text-lg font-bold text-primary">
                  ${nextAvailableSession.price}
                </div>
              )}
            </div>
            
            {onBookSession && (
              <Button 
                className="w-full mt-3" 
                size="sm"
                onClick={() => onBookSession(wavePool.id, nextAvailableSession.time)}
              >
                Book Session
              </Button>
            )}
          </div>
        )}

        {/* Today's Schedule */}
        <div>
          <h4 className="font-medium text-sm mb-3">Today's Schedule</h4>
          <div className="space-y-2">
            {todaysSchedule.map((session, index) => (
              <div 
                key={index}
                className={`
                  flex items-center justify-between p-2 rounded border text-sm
                  ${session.available 
                    ? 'border-success/30 bg-success/5' 
                    : 'border-muted bg-muted/30 text-muted-foreground'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium min-w-16">{session.time}</span>
                  <Badge 
                    variant={session.available ? 'outline' : 'secondary'} 
                    className="text-xs"
                  >
                    {session.sessionType}
                  </Badge>
                  <span className="text-xs">{session.skillLevel}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {session.price && (
                    <span className="text-xs">${session.price}</span>
                  )}
                  <Badge 
                    variant={session.available ? 'success' : 'secondary'}
                    className="text-xs"
                  >
                    {session.available ? 'Available' : 'Booked'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
          <strong>Perfect for:</strong> Consistent waves when natural surf is flat, 
          skill development, and learning in controlled conditions.
        </div>
      </CardContent>
    </Card>
  )
}