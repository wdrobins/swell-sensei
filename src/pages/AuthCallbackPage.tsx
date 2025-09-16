import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Auth callback error:', error)
        toast({
          title: 'Authentication Error',
          description: error.message,
          variant: 'destructive'
        })
        navigate('/')
        return
      }

      if (data.session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('surfer_profiles')
          .select('id')
          .eq('user_id', data.session.user.id)
          .single()

        if (profile) {
          // User has profile, go to spots
          navigate('/spots')
        } else {
          // New user, go to onboarding
          navigate('/onboarding')
        }
        
        toast({
          title: 'Welcome!',
          description: 'Successfully signed in'
        })
      } else {
        navigate('/')
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      navigate('/')
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}