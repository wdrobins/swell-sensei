import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ArrowRight, User2, Activity, Waves, Target, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface OnboardingData {
  name: string
  age: number
  height: number
  weight: number
  yearsSurfing: number
  canDuckDive: boolean
  comfortableWaveSize: string
  experienceTypes: string[]
  paddleFitness: string
  confidence: number
  riskTolerance: string
  homeRadius: number
  favoriteSpots: string[]
  goals: string[]
  injuries: string[]
}

const initialData: OnboardingData = {
  name: '',
  age: 25,
  height: 175,
  weight: 70,
  yearsSurfing: 1,
  canDuckDive: false,
  comfortableWaveSize: 'waist',
  experienceTypes: [],
  paddleFitness: 'medium',
  confidence: 3,
  riskTolerance: 'moderate',
  homeRadius: 50,
  favoriteSpots: [],
  goals: [],
  injuries: []
}

const steps = [
  { id: 'personal', title: 'Personal Info', icon: User2 },
  { id: 'experience', title: 'Surf Experience', icon: Waves },
  { id: 'fitness', title: 'Fitness & Confidence', icon: Activity },
  { id: 'goals', title: 'Goals & Preferences', icon: Target },
  { id: 'location', title: 'Location & Spots', icon: MapPin }
]

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      saveProgress()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const saveProgress = async () => {
    if (!user) return

    try {
      const profileData = {
        user_id: user.id,
        ...data,
        profile_json: data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('surfer_profiles')
        .upsert(profileData)

      if (error) throw error
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }

  const completeOnboarding = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const profileData = {
        user_id: user.id,
        ...data,
        profile_json: data,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('surfer_profiles')
        .upsert(profileData)

      if (error) throw error

      toast({
        title: 'Profile Complete!',
        description: 'Your surf profile has been saved. Ready to find your perfect wave!',
      })

      navigate('/spots')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Personal Info
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">What's your name?</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder="Enter your name"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="12"
                  max="80"
                  value={data.age}
                  onChange={(e) => updateData({ age: parseInt(e.target.value) || 25 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="140"
                  max="220"
                  value={data.height}
                  onChange={(e) => updateData({ height: parseInt(e.target.value) || 175 })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="40"
                  max="150"
                  value={data.weight}
                  onChange={(e) => updateData({ weight: parseInt(e.target.value) || 70 })}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Any current injuries we should know about?</Label>
              <Textarea
                value={data.injuries.join(', ')}
                onChange={(e) => updateData({ injuries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="e.g., shoulder injury, back problems (leave blank if none)"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This helps us recommend spots with easier entry/exit
              </p>
            </div>
          </div>
        )

      case 1: // Experience
        return (
          <div className="space-y-6">
            <div>
              <Label>How many years have you been surfing?</Label>
              <div className="mt-4 space-y-2">
                <Slider
                  value={[data.yearsSurfing]}
                  onValueChange={([value]) => updateData({ yearsSurfing: value })}
                  max={30}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Just starting</span>
                  <span className="font-medium">{data.yearsSurfing} years</span>
                  <span>20+ years</span>
                </div>
              </div>
            </div>

            <div>
              <Label>What's your comfortable wave size?</Label>
              <RadioGroup 
                value={data.comfortableWaveSize} 
                onValueChange={(value) => updateData({ comfortableWaveSize: value })}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="waist" id="waist" />
                  <Label htmlFor="waist">Waist high (0.6m) - Still learning basics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shoulder" id="shoulder" />
                  <Label htmlFor="shoulder">Shoulder high (1.0m) - Building confidence</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="head" id="head" />
                  <Label htmlFor="head">Head high (1.5m) - Comfortable surfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overhead" id="overhead" />
                  <Label htmlFor="overhead">Overhead (2.2m) - Advanced skills</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="double-overhead" id="double" />
                  <Label htmlFor="double">Double overhead (3.5m+) - Expert level</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox 
                  id="duckdive" 
                  checked={data.canDuckDive}
                  onCheckedChange={(checked) => updateData({ canDuckDive: !!checked })}
                />
                <Label htmlFor="duckdive">I can duck dive my board</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Duck diving helps you get through bigger waves safely
              </p>
            </div>

            <div>
              <Label>What types of breaks have you surfed?</Label>
              <div className="mt-3 space-y-2">
                {['beach', 'reef', 'point'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={data.experienceTypes.includes(type)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData({ experienceTypes: [...data.experienceTypes, type] })
                        } else {
                          updateData({ experienceTypes: data.experienceTypes.filter(t => t !== type) })
                        }
                      }}
                    />
                    <Label htmlFor={type} className="capitalize">
                      {type} breaks
                      {type === 'beach' && ' (sand bottom, easier waves)'}
                      {type === 'reef' && ' (coral/rock bottom, more challenging)'}
                      {type === 'point' && ' (longer rides, rocks/reef)'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: // Fitness & Confidence
        return (
          <div className="space-y-6">
            <div>
              <Label>How's your paddle fitness?</Label>
              <RadioGroup 
                value={data.paddleFitness} 
                onValueChange={(value) => updateData({ paddleFitness: value })}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low - I get tired quickly paddling</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium - I can paddle for 30-60 minutes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High - I can paddle for hours</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Confidence level in the water (1-5)</Label>
              <div className="mt-4 space-y-2">
                <Slider
                  value={[data.confidence]}
                  onValueChange={([value]) => updateData({ confidence: value })}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Nervous</span>
                  <span className="font-medium">{data.confidence}/5</span>
                  <span>Very confident</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.confidence <= 2 && "We'll recommend easier, safer spots"}
                {data.confidence === 3 && "We'll suggest moderate challenges"}
                {data.confidence >= 4 && "We can suggest more challenging conditions"}
              </p>
            </div>

            <div>
              <Label>Risk tolerance</Label>
              <RadioGroup 
                value={data.riskTolerance} 
                onValueChange={(value) => updateData({ riskTolerance: value })}
                className="mt-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conservative" id="conservative" />
                  <Label htmlFor="conservative">Conservative - Safety first, I prefer easier conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate - I'll push myself with good conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="aggressive" id="aggressive" />
                  <Label htmlFor="aggressive">Aggressive - I seek challenge and progression</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 3: // Goals
        return (
          <div className="space-y-6">
            <div>
              <Label>What are your surfing goals?</Label>
              <Textarea
                value={data.goals.join('\n')}
                onChange={(e) => updateData({ goals: e.target.value.split('\n').filter(Boolean) })}
                placeholder="e.g.&#10;Learn to surf bigger waves&#10;Improve tube riding&#10;Get more comfortable on reef breaks&#10;Build paddle fitness"
                className="mt-2 min-h-24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                One goal per line - this helps us give you better coaching tips
              </p>
            </div>

            <div>
              <Label>Quick goal tags (select any that apply)</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Bigger waves', 'Tube riding', 'Reef breaks', 'Point breaks',
                  'Duck diving', 'Paddle fitness', 'Pop-up speed', 'Wave reading',
                  'Confidence building', 'Competition prep'
                ].map((goal) => (
                  <Badge
                    key={goal}
                    variant={data.goals.some(g => g.toLowerCase().includes(goal.toLowerCase())) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const hasGoal = data.goals.some(g => g.toLowerCase().includes(goal.toLowerCase()))
                      if (hasGoal) {
                        updateData({ goals: data.goals.filter(g => !g.toLowerCase().includes(goal.toLowerCase())) })
                      } else {
                        updateData({ goals: [...data.goals, goal] })
                      }
                    }}
                  >
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )

      case 4: // Location
        return (
          <div className="space-y-6">
            <div>
              <Label>How far are you willing to travel for surf? ({data.homeRadius}km)</Label>
              <div className="mt-4 space-y-2">
                <Slider
                  value={[data.homeRadius]}
                  onValueChange={([value]) => updateData({ homeRadius: value })}
                  max={200}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Local only</span>
                  <span className="font-medium">{data.homeRadius}km</span>
                  <span>Long trips OK</span>
                </div>
              </div>
            </div>

            <div>
              <Label>Your favorite Surf Coast spots (select all you like)</Label>
              <div className="mt-3 space-y-2">
                {[
                  { id: 'jan-juc', name: 'Jan Juc', description: 'Beginner-friendly beach break' },
                  { id: 'thirteenth-beach', name: '13th Beach', description: 'Multiple peaks, good for onshore days' },
                  { id: 'bells-beach', name: 'Bells Beach', description: 'World-famous point break' },
                  { id: 'winkipop', name: 'Winkipop', description: 'Advanced right-hand point' }
                ].map((spot) => (
                  <div key={spot.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={spot.id}
                      checked={data.favoriteSpots.includes(spot.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData({ favoriteSpots: [...data.favoriteSpots, spot.id] })
                        } else {
                          updateData({ favoriteSpots: data.favoriteSpots.filter(s => s !== spot.id) })
                        }
                      }}
                    />
                    <div>
                      <Label htmlFor={spot.id} className="font-medium">{spot.name}</Label>
                      <p className="text-xs text-muted-foreground">{spot.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <h3 className="font-semibold text-accent mb-2">You're all set!</h3>
              <p className="text-sm text-muted-foreground">
                We'll use this information to give you personalized surf recommendations 
                and safety guidance. You can always update your profile later.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Please sign in to complete your profile</h1>
        <Button onClick={() => navigate('/')}>Go to Homepage</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Setup Your Surf Profile</h1>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
        
        {/* Step indicators */}
        <div className="flex items-center justify-between mt-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isCompleted = index < currentStep
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2
                  ${isActive ? 'border-primary bg-primary text-primary-foreground' : ''}
                  ${isCompleted ? 'border-accent bg-accent text-accent-foreground' : ''}
                  ${!isActive && !isCompleted ? 'border-muted-foreground text-muted-foreground' : ''}
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 ml-2
                    ${isCompleted ? 'bg-accent' : 'bg-muted'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: 'h-5 w-5' })}
            {steps[currentStep].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button onClick={nextStep} disabled={!data.name && currentStep === 0}>
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={completeOnboarding} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        )}
      </div>
    </div>
  )
}