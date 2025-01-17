import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../types';

const SUPABASE_URL = "https://shjwvwhijgehquuteekv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzUwMTUsImV4cCI6MjA0OTM1MTAxNX0.LPqNr6-y38ZsjD9FrBwysFd9G0J417xNd67h5OPGeXE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__
  },
  db: {
    schema: 'public'
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event);
  console.log('Session state:', session ? 'active' : 'none');
});
