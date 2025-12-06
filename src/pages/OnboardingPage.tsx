import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, User, Waves, 
  Target, MapPin, CheckCircle2 
} from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    surfFrequency: '',
    yearsSurfing: '',
    comfortableWaveSize: '',
    experienceTypes: [] as string[],
    paddleFitness: '',
    confidence: 3,
    riskTolerance: '',
    canDuckDive: null as boolean | null,
    goals: [] as string[],
    homeRadius: 25
  });

  const surfFrequencyOptions = [
    'Daily',
    'Weekly',
    'A couple of times a month',
    'Monthly',
    'Every few months',
    'A couple of times a year',
    'Never'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      toast({
        title: "Profile Created!",
        description: "Your surf profile has been set up successfully.",
      });
      navigate('/');
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Let's start with the basics</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <Label>How regularly do you surf?</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {surfFrequencyOptions.filter(f => f !== 'Never').map((frequency) => (
                    <Button
                      key={frequency}
                      variant={formData.surfFrequency === frequency ? 'default' : 'outline'}
                      onClick={() => setFormData({...formData, surfFrequency: frequency})}
                      className="text-sm h-auto py-2"
                    >
                      {frequency}
                    </Button>
                  ))}
                </div>
                <Button
                  variant={formData.surfFrequency === 'Never' ? 'default' : 'outline'}
                  onClick={() => setFormData({...formData, surfFrequency: 'Never', yearsSurfing: ''})}
                  className="w-full text-sm h-auto py-2 mt-3"
                >
                  Never
                </Button>
              </div>
              
              {formData.surfFrequency !== 'Never' && (
                <div>
                  <Label htmlFor="years">Years surfing</Label>
                  <Input
                    id="years"
                    type="number"
                    value={formData.yearsSurfing}
                    onChange={(e) => setFormData({...formData, yearsSurfing: e.target.value})}
                    placeholder="5"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Waves className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Your wave comfort zone</h2>
              <p className="text-muted-foreground">What size waves are you comfortable with?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Comfortable wave size</Label>
              <div className="grid grid-cols-2 gap-3">
                {['waist', 'shoulder', 'head', 'overhead'].map((size) => (
                  <Button
                    key={size}
                    variant={formData.comfortableWaveSize === size ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, comfortableWaveSize: size})}
                    className="capitalize h-12"
                  >
                    {size} high
                  </Button>
                ))}
              </div>
              
              <div className="mt-6">
                <Label>Can you duck dive under waves?</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    variant={formData.canDuckDive === true ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, canDuckDive: true})}
                  >
                    Yes
                  </Button>
                  <Button
                    variant={formData.canDuckDive === false ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, canDuckDive: false})}
                  >
                    No / Learning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-success mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Experience & fitness</h2>
              <p className="text-muted-foreground">What types of breaks have you surfed?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label>Break types you've surfed (select all that apply)</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['beach', 'reef', 'point'].map((type) => (
                    <Button
                      key={type}
                      variant={formData.experienceTypes.includes(type) ? 'default' : 'outline'}
                      onClick={() => toggleArrayValue(
                        formData.experienceTypes, 
                        type, 
                        (arr) => setFormData({...formData, experienceTypes: arr})
                      )}
                      className="capitalize"
                    >
                      {type} break
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Paddle fitness level</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {['low', 'medium', 'high'].map((level) => (
                    <Button
                      key={level}
                      variant={formData.paddleFitness === level ? 'default' : 'outline'}
                      onClick={() => setFormData({...formData, paddleFitness: level})}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle2 className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Confidence & risk</h2>
              <p className="text-muted-foreground">How do you approach surfing?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label>Confidence in the water (1-5)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <Button
                        key={num}
                        variant={formData.confidence === num ? 'default' : 'outline'}
                        onClick={() => setFormData({...formData, confidence: num})}
                        size="sm"
                        className="w-10 h-10"
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">High</span>
                </div>
              </div>
              
              <div>
                <Label>Risk tolerance</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <Button
                    variant={formData.riskTolerance === 'conservative' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, riskTolerance: 'conservative'})}
                  >
                    Nice and easy
                  </Button>
                  <Button
                    variant={formData.riskTolerance === 'moderate' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, riskTolerance: 'moderate'})}
                  >
                    Moderate
                  </Button>
                  <Button
                    variant={formData.riskTolerance === 'aggressive' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, riskTolerance: 'aggressive'})}
                  >
                    SEND IT!
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const goalOptions = [
          'Improve tube riding',
          'Surf bigger waves',
          'Learn to surf reef breaks',
          'Improve technique',
          'Build confidence',
          'Get more barrels'
        ];
        
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Goals & location</h2>
              <p className="text-muted-foreground">What do you want to achieve?</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label>Surf goals (select up to 3)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {goalOptions.map((goal) => (
                    <Button
                      key={goal}
                      variant={formData.goals.includes(goal) ? 'default' : 'outline'}
                      onClick={() => {
                        if (formData.goals.length < 3 || formData.goals.includes(goal)) {
                          toggleArrayValue(
                            formData.goals, 
                            goal, 
                            (arr) => setFormData({...formData, goals: arr})
                          );
                        }
                      }}
                      className="text-left text-sm h-auto p-3"
                      disabled={formData.goals.length >= 3 && !formData.goals.includes(goal)}
                    >
                      {goal}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="radius">How far will you travel to surf? ({formData.homeRadius}km)</Label>
                <input
                  id="radius"
                  type="range"
                  min="5"
                  max="100"
                  value={formData.homeRadius}
                  onChange={(e) => setFormData({...formData, homeRadius: parseInt(e.target.value)})}
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>5km</span>
                  <span>100km</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="shadow-depth">
          <CardHeader>
            <CardTitle className="text-center">
              Surf Caddy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                {currentStep === totalSteps ? 'Complete' : 'Next'}
                {currentStep < totalSteps && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Safety Note */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <p className="text-sm text-primary">
            🌊 This profile helps us provide personalized surf recommendations and safety guidance
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;