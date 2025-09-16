import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockSurferProfile } from '@/lib/mockData';
import { 
  User, Waves, Target, MapPin, TrendingUp, 
  Calendar, Award, Settings, Edit 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const profile = mockSurferProfile;

  const getExperienceColor = () => {
    if (profile.yearsSurfing >= 10) return 'success';
    if (profile.yearsSurfing >= 5) return 'accent';
    if (profile.yearsSurfing >= 2) return 'warning';
    return 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Surfer Profile
            </h1>
            <p className="text-muted-foreground">
              Your skills, preferences, and surf goals
            </p>
          </div>
          <Button asChild>
            <Link to="/onboarding" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">{profile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Age</span>
                  <p className="font-medium">{profile.age} years old</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Years Surfing</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{profile.yearsSurfing} years</span>
                    <Badge variant={getExperienceColor()}>
                      {profile.yearsSurfing >= 10 ? 'Expert' :
                       profile.yearsSurfing >= 5 ? 'Advanced' :
                       profile.yearsSurfing >= 2 ? 'Intermediate' : 'Beginner'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Height / Weight</span>
                  <p className="font-medium">{profile.height}cm / {profile.weight}kg</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Duck Diving</span>
                  <Badge variant={profile.canDuckDive ? 'success' : 'secondary'}>
                    {profile.canDuckDive ? 'Can Duck Dive' : 'Learning'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Home Radius</span>
                  <p className="font-medium">{profile.homeRadius}km from home</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Assessment */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-accent" />
                Skill Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Comfortable Wave Size</span>
                  <p className="font-medium capitalize mb-2">{profile.comfortableWaveSize} high</p>
                  <Progress value={
                    profile.comfortableWaveSize === 'waist' ? 20 :
                    profile.comfortableWaveSize === 'shoulder' ? 40 :
                    profile.comfortableWaveSize === 'head' ? 60 :
                    profile.comfortableWaveSize === 'overhead' ? 80 : 100
                  } className="h-2" />
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Confidence Level</span>
                  <p className="font-medium mb-2">{profile.confidence}/5</p>
                  <Progress value={profile.confidence * 20} className="h-2" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-muted-foreground">Paddle Fitness</span>
                  <Badge variant={
                    profile.paddleFitness === 'high' ? 'success' :
                    profile.paddleFitness === 'medium' ? 'accent' : 'warning'
                  }>
                    {profile.paddleFitness} fitness
                  </Badge>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground">Risk Tolerance</span>
                  <Badge variant={
                    profile.riskTolerance === 'aggressive' ? 'destructive' :
                    profile.riskTolerance === 'moderate' ? 'accent' : 'success'
                  }>
                    {profile.riskTolerance}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Experience Types</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.experienceTypes.map((type, index) => (
                    <Badge key={index} variant="secondary" className="capitalize">
                      {type} breaks
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Surf Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <Award className="h-4 w-4 text-success" />
                    <span>{goal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Favorite Spots */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-warning" />
                Favorite Spots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.favoriteSpots.map((spotId, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <span className="capitalize text-sm">
                      {spotId.replace('-', ' ')}
                    </span>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/spots/${spotId}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-float bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Sessions this month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">85%</div>
                <div className="text-sm text-muted-foreground">Average fit score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">Jan Juc</div>
                <div className="text-sm text-muted-foreground">Most surfed spot</div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                Quick Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-2" />
                Update Home Location
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Waves className="h-4 w-4 mr-2" />
                Safety Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Safety Footer */}
      <div className="mt-12 p-4 bg-warning/10 border border-warning/30 rounded-lg">
        <p className="text-sm text-warning-foreground text-center">
          Keep your profile updated for the most accurate surf recommendations and safety guidance.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;