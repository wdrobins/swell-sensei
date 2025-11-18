import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, MapPin, Waves, Clock } from 'lucide-react';
import { surfSpots, mockForecast, ForecastData, SurfSpot } from '@/lib/mockData';
import { calculateFitScore } from '@/lib/fitScoring';
import SpotCard from './SpotCard';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface UserPreferences {
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
  location?: string;
  goals?: string[];
  waveSize?: string;
}

export default function InteractiveSurfPrompt() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hey there! 👋 Want to discover the perfect surf spots tailored just for you? Just say 'yes' or 'sure' to get started!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [showRecommendations, setShowRecommendations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'bot' | 'user') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const isConfirmation = (text: string): boolean => {
    const confirmWords = ['yes', 'yeah', 'sure', 'ok', 'okay', 'yep', 'yup', 'definitely', 'absolutely', 'lets go', "let's go"];
    return confirmWords.some(word => text.toLowerCase().includes(word));
  };

  const handleSkillSelection = (skill: 'beginner' | 'intermediate' | 'advanced') => {
    setPreferences(prev => ({ ...prev, skillLevel: skill }));
    addMessage(skill.charAt(0).toUpperCase() + skill.slice(1), 'user');
    setTimeout(() => {
      addMessage("Great choice! 🌊 What's your preferred location or region? (e.g., Gold Coast, Byron Bay, Sydney)", 'bot');
      setStep(2);
    }, 500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    addMessage(userMessage, 'user');
    setInput('');

    setTimeout(() => {
      processUserInput(userMessage);
    }, 500);
  };

  const processUserInput = (userInput: string) => {
    if (step === 0 && isConfirmation(userInput)) {
      addMessage("Awesome! Let's find your perfect waves. 🏄‍♂️ First, what's your skill level?", 'bot');
      setStep(1);
    } else if (step === 2) {
      // Location step
      setPreferences(prev => ({ ...prev, location: userInput }));
      addMessage("Perfect! Finally, what are you looking to achieve? (Select one or more)", 'bot');
      setStep(3);
    } else if (step === 3) {
      // Goals step - parse the input for goals
      const goals = [];
      if (userInput.toLowerCase().includes('improve') || userInput.toLowerCase().includes('progress')) {
        goals.push('improve');
      }
      if (userInput.toLowerCase().includes('fun') || userInput.toLowerCase().includes('enjoy')) {
        goals.push('fun');
      }
      if (userInput.toLowerCase().includes('fitness') || userInput.toLowerCase().includes('exercise')) {
        goals.push('fitness');
      }
      if (goals.length === 0) goals.push('fun'); // Default

      setPreferences(prev => ({ ...prev, goals }));
      addMessage("Analyzing conditions and finding your perfect spots... 🔍", 'bot');
      
      setTimeout(() => {
        setShowRecommendations(true);
        addMessage("Here are my personalized recommendations for you! Check out the spots below that match your profile. 🎯", 'bot');
      }, 1500);
    } else {
      addMessage("I didn't quite catch that. Could you try again?", 'bot');
    }
  };

  const getRecommendedSpots = () => {
    // Map skill levels to wave sizes
    const skillToWaveSize = {
      beginner: 'waist',
      intermediate: 'shoulder',
      advanced: 'overhead'
    };

    const mockProfile = {
      id: 'temp-user',
      name: 'Guest',
      age: 25,
      height: 175,
      weight: 70,
      yearsSurfing: preferences.skillLevel === 'beginner' ? 1 : preferences.skillLevel === 'intermediate' ? 3 : 5,
      comfortableWaveSize: skillToWaveSize[preferences.skillLevel || 'intermediate'] as any,
      experienceTypes: ['beach', 'point', 'reef'] as ('beach' | 'reef' | 'point')[],
      paddleFitness: (preferences.skillLevel === 'beginner' ? 'low' : preferences.skillLevel === 'intermediate' ? 'medium' : 'high') as 'low' | 'medium' | 'high',
      confidence: preferences.skillLevel === 'beginner' ? 3 : preferences.skillLevel === 'intermediate' ? 4 : 5,
      riskTolerance: (preferences.skillLevel === 'beginner' ? 'conservative' : preferences.skillLevel === 'intermediate' ? 'moderate' : 'aggressive') as 'conservative' | 'moderate' | 'aggressive',
      canDuckDive: preferences.skillLevel !== 'beginner',
      goals: preferences.goals || ['fun'],
      homeRadius: 50,
      favoriteSpots: [],
      injuries: []
    };

    // Filter and score spots
    const spotsWithScores = surfSpots
      .filter(spot => {
        if (preferences.location) {
          return spot.region.toLowerCase().includes(preferences.location.toLowerCase()) ||
                 spot.name.toLowerCase().includes(preferences.location.toLowerCase());
        }
        return true;
      })
      .map(spot => {
        const forecast = mockForecast[spot.id]?.[0];
        if (!forecast) return null;
        
        const result = calculateFitScore(spot, forecast, mockProfile);
        return { spot, result };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.result.score || 0) - (a?.result.score || 0))
      .slice(0, 3) as Array<{ spot: SurfSpot; result: any }>;

    return spotsWithScores;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">AI Surf Caddy</h3>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Skill level buttons */}
          {step === 1 && (
            <div className="flex flex-wrap gap-2 justify-start">
              <Button
                onClick={() => handleSkillSelection('beginner')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Waves className="h-4 w-4" />
                Beginner
              </Button>
              <Button
                onClick={() => handleSkillSelection('intermediate')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Waves className="h-4 w-4" />
                Intermediate
              </Button>
              <Button
                onClick={() => handleSkillSelection('advanced')}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Waves className="h-4 w-4" />
                Advanced
              </Button>
            </div>
          )}

          {/* Goals buttons */}
          {step === 3 && (
            <div className="flex flex-wrap gap-2 justify-start">
              <Button
                onClick={() => {
                  setPreferences(prev => ({ ...prev, goals: ['improve'] }));
                  processUserInput('improve skills');
                }}
                variant="outline"
                size="sm"
              >
                Improve Skills
              </Button>
              <Button
                onClick={() => {
                  setPreferences(prev => ({ ...prev, goals: ['fun'] }));
                  processUserInput('have fun');
                }}
                variant="outline"
                size="sm"
              >
                Have Fun
              </Button>
              <Button
                onClick={() => {
                  setPreferences(prev => ({ ...prev, goals: ['fitness'] }));
                  processUserInput('stay fit');
                }}
                variant="outline"
                size="sm"
              >
                Stay Fit
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recommendations */}
        {showRecommendations && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-accent" />
              <h4 className="font-semibold">Your Personalized Spots</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getRecommendedSpots().map(({ spot, result }) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  fitScore={result.score}
                  fitLabel={result.label}
                />
              ))}
            </div>
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium text-sm mb-1">Best Time to Surf</p>
                  <p className="text-sm text-muted-foreground">
                    Based on your {preferences.skillLevel} level, we recommend surfing during {
                      preferences.skillLevel === 'beginner' ? 'smaller morning swells (6-9am)' :
                      preferences.skillLevel === 'intermediate' ? 'mid-morning sessions (7-11am)' :
                      'dawn patrol or evening glass-off sessions'
                    }.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Input area */}
        {!showRecommendations && step !== 1 && (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
