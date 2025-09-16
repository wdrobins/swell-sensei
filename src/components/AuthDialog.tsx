import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'
import { Mail, LogIn, UserPlus } from 'lucide-react'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: 'signin' | 'signup'
}

export default function AuthDialog({ open, onOpenChange, mode = 'signin' }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signIn, signInWithProvider } = useAuth()
  const { toast } = useToast()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    const { error } = await signIn(email)
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      setEmailSent(true)
      toast({
        title: 'Check your email',
        description: 'We sent you a magic link to sign in',
      })
    }
    setIsLoading(false)
  }

  const handleProviderSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true)
    const { error } = await signInWithProvider(provider)
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
    setIsLoading(false)
  }

  const resetForm = () => {
    setEmail('')
    setEmailSent(false)
    setIsLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'signup' ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'signup' 
              ? 'Create your surf profile to get personalized recommendations'
              : 'Welcome back! Sign in to access your surf profile and recommendations'
            }
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="text-center py-6">
            <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Check your email</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <Button variant="outline" onClick={resetForm}>
              Try different email
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Social Sign In */}
            <div className="space-y-2">
              <Button
                onClick={() => handleProviderSignIn('google')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                onClick={() => handleProviderSignIn('facebook')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  'Sending magic link...'
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send magic link
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              {mode === 'signup' && ' Your profile data helps us provide better surf recommendations.'}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}