import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.info('Supabase auth event:', event);
        
        if (event === 'SIGNED_IN') {
          console.info('User signed in:', currentSession?.user?.id);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          toast({
            title: "התחברת בהצלחה",
            description: "ברוך הבא!",
          });
        }

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          toast({
            title: "התנתקת בהצלחה",
            description: "להתראות!",
          });
        }

        if (event === 'TOKEN_REFRESHED') {
          console.info('Token refreshed successfully');
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};