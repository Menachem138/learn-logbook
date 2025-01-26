import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'light',
  storageKey = 'app-theme'
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Load theme from storage or user profile on mount
  useEffect(() => {
    async function loadTheme() {
      // First try to load from local storage if available
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
          document.documentElement.classList.toggle('dark', stored === 'dark');
          return;
        }
      }

      // Fall back to user profile if available
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
  }, [storageKey]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    // Save to local storage if available
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, newTheme);
    }

    // Save to user profile if logged in
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

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
