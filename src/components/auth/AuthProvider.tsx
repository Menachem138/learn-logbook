import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session from localStorage
    const storedSession = localStorage.getItem('supabase.auth.token');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        console.log('Found stored session:', parsedSession);
        setSession(parsedSession);
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial Supabase session:', session);
      if (session) {
        setSession(session);
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      setSession(session);
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}
