import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Load theme from user profile on mount
  useEffect(() => {
    async function loadTheme() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data } = await supabase
          .from('user_profiles')
          .select('theme')
          .eq('id', session.user.id)
          .maybeSingle();
        
        if (data?.theme) {
          setTheme(data.theme as Theme);
          document.documentElement.classList.toggle('dark', data.theme === 'dark');
        }
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      await supabase
        .from('user_profiles')
        .update({ theme: newTheme })
        .eq('id', session.user.id);
    }
  };

  const value = {
    theme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
