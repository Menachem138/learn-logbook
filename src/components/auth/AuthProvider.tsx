import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session and set up refresh
    const setupAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (currentSession) {
          console.log('Initial session loaded:', currentSession);
          setSession(currentSession);
        } else {
          console.log('No initial session found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error setting up auth:', error);
        toast({
          title: "שגיאה בטעינת המשתמש",
          description: "אנא נסה להתחבר מחדש",
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    setupAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('Setting new session after', event);
        setSession(currentSession);
        navigate('/');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "שגיאה בהתנתקות",
        description: "אנא נסה שוב",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null,
      loading,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}