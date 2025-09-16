import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Camera, MapPin, Star, Upload, Plus } from 'lucide-react'
import { format } from 'date-fns'
import type { SurfSpot } from '@/lib/mockData'

interface SessionLoggerProps {
  spot?: SurfSpot
  onLogSaved?: () => void
}

interface SessionLog {
  spotId: string
  date: string
  rating: number
  notes: string
  photoFiles: File[]
  gpsData?: { lat: number; lng: number }
}

export default function SessionLogger({ spot, onLogSaved }: SessionLoggerProps) {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<SessionLog>({
    spotId: spot?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    rating: 3,
    notes: '',
    photoFiles: [],
    gpsData: undefined
  })
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !user) return

    setUploadingPhotos(true)
    const newFiles = Array.from(files)
    
    // Limit to 5 photos total
    const totalFiles = log.photoFiles.length + newFiles.length
    if (totalFiles > 5) {
      toast({
        title: 'Too many photos',
        description: 'Maximum 5 photos per session',
        variant: 'destructive'
      })
      setUploadingPhotos(false)
      return
    }

    setLog(prev => ({
      ...prev,
      photoFiles: [...prev.photoFiles, ...newFiles]
    }))
    setUploadingPhotos(false)
  }

  const removePhoto = (index: number) => {
    setLog(prev => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLog(prev => ({
          ...prev,
          gpsData: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }))
        toast({
          title: 'Location captured',
          description: 'GPS coordinates saved with your session'
        })
      }, (error) => {
        toast({
          title: 'Location access denied',
          description: 'Unable to capture GPS location',
          variant: 'destructive'
        })
      })
    }
  }

  const uploadPhotos = async (): Promise<string[]> => {
    if (log.photoFiles.length === 0) return []

    const uploadPromises = log.photoFiles.map(async (file) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('session-photos')
        .upload(fileName, file)

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('session-photos')
        .getPublicUrl(data.path)

      return urlData.publicUrl
    })

    return Promise.all(uploadPromises)
  }

  const saveSession = async () => {
    if (!user || !log.spotId || !log.rating) {
      toast({
        title: 'Missing information',
        description: 'Please select a spot and rating',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      // Upload photos first
      const photoUrls = await uploadPhotos()

      // Get current conditions for this spot (would be from live forecast)
      const conditionsJson = {
        logged_at: new Date().toISOString(),
        estimated_conditions: {
          wave_size: '1-2ft',
          wind: 'Light offshore',
          tide: 'Mid rising'
        }
      }

      const { error } = await supabase
        .from('session_logs')
        .insert({
          user_id: user.id,
          spot_id: log.spotId,
          date: log.date,
          rating: log.rating,
          notes: log.notes,
          photo_urls: photoUrls,
          gps_data: log.gpsData,
          conditions_json: conditionsJson
        })

      if (error) throw error

      toast({
        title: 'Session logged!',
        description: 'Your surf session has been saved'
      })

      // Reset form
      setLog({
        spotId: spot?.id || '',
        date: format(new Date(), 'yyyy-MM-dd'),
        rating: 3,
        notes: '',
        photoFiles: [],
        gpsData: undefined
      })

      setOpen(false)
      onLogSaved?.()
    } catch (error) {
      console.error('Error saving session:', error)
      toast({
        title: 'Error',
        description: 'Failed to save session log',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Log This Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Your Surf Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Spot Selection */}
          <div>
            <Label htmlFor="spot">Surf Spot</Label>
            <Input
              id="spot"
              value={spot?.name || 'Select a spot'}
              disabled
              className="mt-1"
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={log.date}
              onChange={(e) => setLog(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Rating */}
          <div>
            <Label>Session Rating</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant={log.rating === rating ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLog(prev => ({ ...prev, rating }))}
                  className="p-2"
                >
                  <Star className={`w-4 h-4 ${log.rating >= rating ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              1 = Poor conditions, 5 = Epic session
            </p>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              value={log.notes}
              onChange={(e) => setLog(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How was the surf? What did you work on? Any highlights?"
              className="mt-1 min-h-20"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Photos ({log.photoFiles.length}/5)</Label>
            <div className="mt-2 space-y-2">
              {log.photoFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {log.photoFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="Session photo"
                        className="w-full h-20 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removePhoto(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                  disabled={uploadingPhotos || log.photoFiles.length >= 5}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  disabled={uploadingPhotos || log.photoFiles.length >= 5}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploadingPhotos ? 'Uploading...' : 'Add Photos'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={!!log.gpsData}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {log.gpsData ? 'GPS Saved' : 'Get GPS'}
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={saveSession} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}