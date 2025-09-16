import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Settings, Save, RotateCcw, TrendingUp, Database } from 'lucide-react'
import type { ScoringWeights } from '@/lib/fitScoring'

interface AdminPanelProps {
  isAdmin?: boolean
}

export default function AdminPanel({ isAdmin = false }: AdminPanelProps) {
  const [weights, setWeights] = useState<ScoringWeights>({
    waveSize: 0.35,
    wind: 0.25,
    tide: 0.15,
    hazards: 0.10,
    experience: 0.10,
    confidence: 0.05
  })
  const [previewScore, setPreviewScore] = useState<number>(75)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  // Load current weights
  useEffect(() => {
    loadWeights()
  }, [])

  // Update preview when weights change
  useEffect(() => {
    calculatePreview()
  }, [weights])

  const loadWeights = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('scoring_weights')
        .select('*')
        .eq('is_default', true)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw error
      }

      if (data) {
        setWeights({
          waveSize: data.wave_size,
          wind: data.wind,
          tide: data.tide,
          hazards: data.hazards,
          experience: data.experience,
          confidence: data.confidence
        })
      }
    } catch (error) {
      console.error('Error loading weights:', error)
      toast({
        title: 'Error',
        description: 'Failed to load scoring weights',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveWeights = async () => {
    if (!user || !isAdmin) return

    setIsSaving(true)
    try {
      // First, unset any existing default
      await supabase
        .from('scoring_weights')
        .update({ is_default: false })
        .eq('is_default', true)

      // Insert new default weights
      const { error } = await supabase
        .from('scoring_weights')
        .insert({
          name: 'Default Weights',
          wave_size: weights.waveSize,
          wind: weights.wind,
          tide: weights.tide,
          hazards: weights.hazards,
          experience: weights.experience,
          confidence: weights.confidence,
          is_default: true
        })

      if (error) throw error

      toast({
        title: 'Weights saved',
        description: 'Scoring weights have been updated'
      })
    } catch (error) {
      console.error('Error saving weights:', error)
      toast({
        title: 'Error',
        description: 'Failed to save scoring weights',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = () => {
    setWeights({
      waveSize: 0.35,
      wind: 0.25,
      tide: 0.15,
      hazards: 0.10,
      experience: 0.10,
      confidence: 0.05
    })
  }

  const calculatePreview = () => {
    // Simple preview calculation showing how weights affect scoring
    const baseScore = 70
    const waveBonus = (weights.waveSize - 0.35) * 100
    const windBonus = (weights.wind - 0.25) * 100
    const tideBonus = (weights.tide - 0.15) * 100
    
    const score = Math.max(0, Math.min(100, baseScore + waveBonus + windBonus + tideBonus))
    setPreviewScore(Math.round(score))
  }

  const updateWeight = (key: keyof ScoringWeights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }))
  }

  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0)
  const isValidWeights = Math.abs(totalWeight - 1.0) < 0.01

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground">
            You need admin privileges to access the scoring weight controls.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Configure scoring weights and preview their impact
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Settings className="w-3 h-3 mr-1" />
          Admin Mode
        </Badge>
      </div>

      <Tabs defaultValue="scoring" className="w-full">
        <TabsList>
          <TabsTrigger value="scoring">Scoring Weights</TabsTrigger>
          <TabsTrigger value="spots">Spot Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weight Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Scoring Weight Configuration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adjust how different factors influence the fit score calculation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="capitalize">
                        {key === 'waveSize' ? 'Wave Size' : key}
                      </Label>
                      <span className="text-sm font-medium">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([newValue]) => updateWeight(key as keyof ScoringWeights, newValue)}
                      max={0.5}
                      min={0.05}
                      step={0.05}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5%</span>
                      <span>50%</span>
                    </div>
                  </div>
                ))}

                {/* Weight Validation */}
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between text-sm">
                    <span>Total Weight:</span>
                    <span className={`font-medium ${isValidWeights ? 'text-success' : 'text-destructive'}`}>
                      {(totalWeight * 100).toFixed(1)}%
                    </span>
                  </div>
                  {!isValidWeights && (
                    <p className="text-xs text-destructive mt-1">
                      Weights should total 100% for optimal scoring
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={resetToDefaults} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    onClick={saveWeights} 
                    disabled={isSaving || !isValidWeights}
                    size="sm"
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Weights'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  See how weight changes affect scoring for a typical surf spot
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview Score */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {previewScore}
                  </div>
                  <Badge 
                    variant={
                      previewScore >= 80 ? 'success' :
                      previewScore >= 60 ? 'accent' :
                      previewScore >= 40 ? 'warning' : 'destructive'
                    }
                  >
                    {previewScore >= 80 ? 'Send it' :
                     previewScore >= 60 ? 'Manageable' :
                     previewScore >= 40 ? 'Stretch' : 'No-Go'}
                  </Badge>
                </div>

                {/* Weight Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Weight Distribution:</h4>
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="capitalize">
                        {key === 'waveSize' ? 'Wave Size' : key}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${(value / 0.5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs w-8 text-right">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Example Scenario */}
                <div className="p-3 bg-accent/10 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Example Scenario:</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Wave size: 1.5m (within comfort zone)</div>
                    <div>• Wind: 12kt offshore (favorable)</div>
                    <div>• Tide: Mid-rising (ideal)</div>
                    <div>• Hazards: Moderate rocks</div>
                    <div>• Experience: Familiar break type</div>
                    <div>• Confidence: High (4/5)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spots">
          <Card>
            <CardHeader>
              <CardTitle>Spot Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add, edit, and manage surf spots in the database
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Spot management interface coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monitor app usage and scoring patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Analytics dashboard coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}