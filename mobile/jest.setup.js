// Import Jest globals
const { beforeEach, afterEach, jest } = require('@jest/globals');

// Polyfill setImmediate for Jest environment
global.setImmediate = (callback) => setTimeout(callback, 0);

// Mock basic React Native components
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn(obj => obj.ios) },
  StyleSheet: {
    create: jest.fn(styles => styles),
    compose: jest.fn(),
    flatten: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Animated: {
    Value: jest.fn(),
    timing: jest.fn(),
  },
}));

// Mock environment variables for Supabase
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Create default Supabase mock implementation
const createDefaultSupabaseMock = () => ({
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { 
            id: 'test-session-id',
            user_id: 'test-user-id',
            type: 'studying',
            started_at: new Date().toISOString(),
            ended_at: null,
            duration: null
          },
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: { 
          id: 'test-session-id',
          user_id: 'test-user-id',
          type: 'studying',
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          duration: 5000
        },
        error: null
      }))
    }))
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis()
  })),
  removeChannel: jest.fn()
});

// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { 
              id: 'test-session-id',
              user_id: 'test-user-id',
              type: 'studying',
              started_at: new Date().toISOString(),
              ended_at: null,
              duration: null
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: { 
            id: 'test-session-id',
            user_id: 'test-user-id',
            type: 'studying',
            started_at: new Date().toISOString(),
            ended_at: new Date().toISOString(),
            duration: 5000
          },
          error: null
        }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis()
    })),
    removeChannel: jest.fn()
  };
  return {
    supabaseMobile: mockSupabase,
    createClient: jest.fn(() => mockSupabase)
  };
});

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
      }
    }
  }
}));

// Mock expo packages
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-token' }),
  AndroidImportance: { MAX: 'max' },
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  modelId: 'test-device',
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
}));

// Mock UI packages
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock timer functions
// Mock timer functions are now handled in individual test files

// Mock app components
jest.mock('./src/contexts/AuthProvider', () => ({
  useAuth: () => ({
    session: {
      user: { id: 'test-user-id' }
    }
  }),
  AuthProvider: ({ children }) => {
    const React = require('react');
    return React.createElement(React.Fragment, null, children);
  }
}));

jest.mock('./src/hooks/useRealtimeSync', () => ({
  useRealtimeSync: jest.fn()
}));

// Create Supabase mock first
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({
          data: { id: 'test-session-id' },
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({
        data: { id: 'test-session-id' },
        error: null
      }))
    }))
  })),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis()
  })),
  removeChannel: jest.fn()
};

// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => ({
  supabaseMobile: mockSupabase
}));

// Use Jest's built-in timer mocks
jest.useFakeTimers();

jest.mock('./src/features/StudyTimeTracker/TimerDisplay', () => ({
  TimerDisplay: ({ time, timerState }) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, null, [
      React.createElement(Text, { key: 'time' }, time === 0 ? '00:00.00' : '00:01.00'),
    ]);
  }
}));

jest.mock('./src/features/StudyTimeTracker/TimerControls', () => ({
  TimerControls: ({ timerState, onStartStudy, onStartBreak, onStop }) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, null, [
      React.createElement(Text, { key: 'study', onPress: onStartStudy }, 'למידה'),
      React.createElement(Text, { key: 'stop', onPress: onStop }, timerState === 'STOPPED' ? 'למידה' : 'עצור'),
    ]);
  }
}));

jest.mock('./src/features/StudyTimeTracker/TimerStats', () => ({
  TimerStats: ({ totalStudyTime, totalBreakTime, currentTime, timerState }) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(View, null, [
      React.createElement(Text, { key: 'stats' }, 'מעקב זמן למידה'),
    ]);
  }
}));

// Note: Test lifecycle hooks (beforeEach/afterEach) are defined in individual test files
// rather than globally to avoid conflicts and provide better test isolation
