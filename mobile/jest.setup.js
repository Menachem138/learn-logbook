// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => {
  const createChainedMock = () => {
    const chain = {
      insert: jest.fn().mockReturnValue(chain),
      upsert: jest.fn().mockReturnValue(chain),
      select: jest.fn().mockReturnValue(chain),
      update: jest.fn().mockReturnValue(chain),
      delete: jest.fn().mockReturnValue(chain),
      eq: jest.fn().mockReturnValue(chain),
      order: jest.fn().mockReturnValue(chain),
      limit: jest.fn().mockReturnValue(chain),
      single: jest.fn().mockReturnValue(chain),
      match: jest.fn().mockReturnValue(chain),
      then: jest.fn((resolve) => resolve({ data: null, error: null })),
    };
    return chain;
  };

  return {
    supabaseMobile: {
      from: jest.fn(() => createChainedMock()),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      })),
      removeChannel: jest.fn(),
    },
  };
});

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
