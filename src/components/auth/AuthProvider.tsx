import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  toggleBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  toggleBiometric: async () => {},
  authenticateWithBiometric: async () => false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    isAvailable: isBiometricAvailable,
    isBiometricEnabled,
    toggleBiometric,
    authenticateWithBiometric,
    checkBiometricAvailability
  } = useBiometricAuth();

  useEffect(() => {
    checkBiometricAvailability();
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null,
      loading,
      isBiometricAvailable,
      isBiometricEnabled,
      toggleBiometric,
      authenticateWithBiometric
    }}>
      {children}
    </AuthContext.Provider>
  );
}
