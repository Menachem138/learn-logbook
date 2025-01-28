import { createContext } from 'react';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  session: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
});
