import React, { useCallback, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext } from '@/hooks/auth-context';
import { useToast } from '@/hooks/use-toast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "התחברת בהצלחה",
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "שגיאה בהתחברות",
        description: "אנא בדוק את הפרטים ונסה שוב",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "התנתקת בהצלחה",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "שגיאה בהתנתקות",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "נרשמת בהצלחה",
        description: "נשלח אליך מייל אימות",
      });
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "שגיאה בהרשמה",
        description: "אנא בדוק את הפרטים ונסה שוב",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return (
    <AuthContext.Provider value={{ session, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};
