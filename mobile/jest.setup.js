// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => ({
  supabaseMobile: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(),
  __metadata__: { version: 1 },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  AndroidImportance: {
    MAX: 'max',
  },
  scheduleNotificationAsync: jest.fn(),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  modelId: 'test-device',
}));

// Mock AuthProvider context
jest.mock('./src/contexts/AuthProvider', () => ({
  useAuth: () => ({
    session: {
      user: {
        id: 'test-user-id',
      },
    },
  }),
  AuthProvider: ({ children }) => children,
}));
