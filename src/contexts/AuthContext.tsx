import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type AuthResultError = AuthError | Error | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthResultError }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthResultError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthResultError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map auth errors to safe, user-friendly messages
const getSafeErrorMessage = (error: AuthError | Error | null, context: 'signin' | 'signup' | 'signout' | 'reset'): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  // Known safe error codes that can be shown to users
  const safeErrorMap: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password.',
    'user_not_found': 'Invalid email or password.',
    'email_not_confirmed': 'Please verify your email before signing in.',
    'user_already_exists': 'An account with this email already exists.',
    'weak_password': 'Please choose a stronger password.',
    'over_request_rate_limit': 'Too many attempts. Please try again later.',
    'email_address_invalid': 'Please enter a valid email address.',
  };
  
  // Check if we have a known error code
  if ('code' in error && typeof error.code === 'string' && safeErrorMap[error.code]) {
    return safeErrorMap[error.code];
  }
  
  // Generic fallback messages based on context
  const contextMessages: Record<string, string> = {
    signin: 'Unable to sign in. Please check your credentials and try again.',
    signup: 'Unable to create account. Please try again.',
    signout: 'Unable to sign out. Please try again.',
    reset: 'Unable to send reset email. Please try again.',
  };
  
  return contextMessages[context] || 'An unexpected error occurred. Please try again.';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: getSafeErrorMessage(error, 'signup'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
      }

      return { error };
    } catch (error: unknown) {
      const caughtError = error instanceof Error ? error : new Error('An unexpected error occurred.');
      toast({
        title: "Error",
        description: getSafeErrorMessage(caughtError, 'signup'),
        variant: "destructive",
      });
      return { error: caughtError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: getSafeErrorMessage(error, 'signin'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      }

      return { error };
    } catch (error: unknown) {
      const caughtError = error instanceof Error ? error : new Error('An unexpected error occurred.');
      toast({
        title: "Error",
        description: getSafeErrorMessage(caughtError, 'signin'),
        variant: "destructive",
      });
      return { error: caughtError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: getSafeErrorMessage(error, 'signout'),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const resetPasswordRedirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetPasswordRedirectUrl,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: getSafeErrorMessage(error, 'reset'),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a password reset link.",
        });
      }

      return { error };
    } catch (error: unknown) {
      const caughtError = error instanceof Error ? error : new Error('An unexpected error occurred.');
      toast({
        title: "Error",
        description: getSafeErrorMessage(caughtError, 'reset'),
        variant: "destructive",
      });
      return { error: caughtError };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
