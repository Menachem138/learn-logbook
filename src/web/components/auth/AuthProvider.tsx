import { createContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { realtimeSync } from '@/services/RealtimeSyncService'

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      if (session?.user) {
        // Initialize real-time sync when user logs in
        realtimeSync.subscribeToUserSpecificData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session);
      setSession(session);
      if (session?.user) {
        // Initialize real-time sync when user logs in
        realtimeSync.subscribeToUserSpecificData(session.user.id);
      } else {
        // Cleanup real-time sync when user logs out
        realtimeSync.unsubscribeFromAll();
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      // Cleanup real-time sync
      realtimeSync.unsubscribeFromAll();
    };
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
