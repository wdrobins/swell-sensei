import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, Waves, Target, MapPin, TrendingUp, 
  Calendar, Award, Settings, Edit, Save
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    skill_level: '',
    experience_years: 0,
    preferred_wave_size: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
      setEditForm({
        skill_level: data.skill_level || '',
        experience_years: data.experience_years || 0,
        preferred_wave_size: data.preferred_wave_size || ''
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        skill_level: editForm.skill_level,
        experience_years: editForm.experience_years,
        preferred_wave_size: editForm.preferred_wave_size,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Your profile has been updated!",
      });
      setIsEditing(false);
      fetchProfile();
    }
    
    setIsSaving(false);
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const getSkillBadgeVariant = (skill: string) => {
    switch (skill) {
      case 'expert': return 'success';
      case 'advanced': return 'accent';
      case 'intermediate': return 'warning';
      case 'beginner': return 'secondary';
      default: return 'secondary';
    }
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
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info & Skill Level */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Surfing Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill_level">Skill Level</Label>
                    <Select
                      value={editForm.skill_level}
                      onValueChange={(value) => setEditForm({ ...editForm, skill_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input
                      id="experience_years"
                      type="number"
                      min="0"
                      value={editForm.experience_years}
                      onChange={(e) => setEditForm({ ...editForm, experience_years: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preferred_wave_size">Preferred Wave Size</Label>
                    <Input
                      id="preferred_wave_size"
                      placeholder="e.g., 2-4ft"
                      value={editForm.preferred_wave_size}
                      onChange={(e) => setEditForm({ ...editForm, preferred_wave_size: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Display Name</span>
                      <p className="font-medium">{profile.display_name || 'Not set'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Skill Level</span>
                      <div className="mt-1">
                        {profile.skill_level ? (
                          <Badge variant={getSkillBadgeVariant(profile.skill_level)} className="capitalize">
                            {profile.skill_level}
                          </Badge>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Not set - Set your skill level to get personalized recommendations!</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Years of Experience</span>
                      <p className="font-medium">{profile.experience_years || 'Not set'} {profile.experience_years ? 'years' : ''}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Preferred Wave Size</span>
                      <p className="font-medium">{profile.preferred_wave_size || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!profile.skill_level && !isEditing && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    💡 Set your skill level to get personalized surf spot recommendations and safety guidance!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Assessment - Placeholder for future features */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-accent" />
                Additional Skills (Coming Soon)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                More detailed skill assessments and tracking features coming soon!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-float bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Profile Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {profile.skill_level ? '✓' : '○'}
                </div>
                <div className="text-sm text-muted-foreground">Skill Level Set</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {profile.experience_years || 0}
                </div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-success">
                  {profile.preferred_wave_size || 'Not set'}
                </div>
                <div className="text-sm text-muted-foreground">Preferred Wave Size</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-float">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/plan">
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan a Session
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/spots">
                  <MapPin className="h-4 w-4 mr-2" />
                  Browse Surf Spots
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/logs">
                  <Waves className="h-4 w-4 mr-2" />
                  View Session Logs
                </Link>
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