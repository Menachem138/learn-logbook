import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

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
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error fetching session:', error);
          toast({
            title: "שגיאה בטעינת המשתמש",
            description: "אנא נסה להתחבר מחדש",
            variant: "destructive",
          });
          return;
        }
        console.log('Initial session:', session);
        setSession(session);
      })
      .catch(error => {
        console.error('Error in getSession:', error);
      })
      .finally(() => {
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
  }, [toast]);

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