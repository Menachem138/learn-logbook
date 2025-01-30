import Constants from 'expo-constants';

// Supabase configuration
export const SUPABASE_URL = "https://shjwvwhijgehquuteekv.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoand2d2hpamdlaHF1dXRlZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM3NzUwMTUsImV4cCI6MjA0OTM1MTAxNX0.LPqNr6-y38ZsjD9FrBwysFd9G0J417xNd67h5OPGeXE";

// App configuration
export const APP_ENV = Constants.expoConfig?.extra?.APP_ENV || 'development';
export const IS_DEVELOPMENT = APP_ENV === 'development';

// API configuration
export const API_URL = IS_DEVELOPMENT
  ? 'http://localhost:3000'
  : 'https://learn-logbook.lovable.app';

// Push Notifications
export const EXPO_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId || '';

// Storage configuration
export const STORAGE_KEY_PREFIX = '@learn_logbook:';
export const AUTH_STORAGE_KEY = `${STORAGE_KEY_PREFIX}auth`;
export const SETTINGS_STORAGE_KEY = `${STORAGE_KEY_PREFIX}settings`;
