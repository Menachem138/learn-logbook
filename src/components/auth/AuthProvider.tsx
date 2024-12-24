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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.error('Error fetching initial session:', error);
        toast({
          title: "שגיאה בטעינת המשתמש",
          description: "אנא נסה להתחבר מחדש",
          variant: "destructive",
        });
        return;
      }
      
      if (initialSession) {
        setSession(initialSession);
      } else {
        // If no session, redirect to login
        navigate('/login');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('Auth state changed:', event, currentSession);
      
      if (event === 'SIGNED_OUT') {
        setSession(null);
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
      await supabase.auth.signOut();
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