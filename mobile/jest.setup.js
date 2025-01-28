// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => {
  const createQueryBuilder = () => {
    const queryBuilder = {
      data: null,
      error: null,
      // Query methods
      select: jest.fn().mockReturnValue(queryBuilder),
      insert: jest.fn().mockImplementation(() => {
        return {
          select: jest.fn().mockImplementation(() => ({
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'test-session-id' }, 
              error: null 
            })
          }))
        };
      }),
      upsert: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: null, error: null });
      }),
      update: jest.fn().mockReturnValue(queryBuilder),
      delete: jest.fn().mockReturnValue(queryBuilder),
      // Filters
      eq: jest.fn().mockReturnValue(queryBuilder),
      neq: jest.fn().mockReturnValue(queryBuilder),
      gt: jest.fn().mockReturnValue(queryBuilder),
      lt: jest.fn().mockReturnValue(queryBuilder),
      gte: jest.fn().mockReturnValue(queryBuilder),
      lte: jest.fn().mockReturnValue(queryBuilder),
      like: jest.fn().mockReturnValue(queryBuilder),
      ilike: jest.fn().mockReturnValue(queryBuilder),
      is: jest.fn().mockReturnValue(queryBuilder),
      in: jest.fn().mockReturnValue(queryBuilder),
      // Modifiers
      order: jest.fn().mockReturnValue(queryBuilder),
      limit: jest.fn().mockReturnValue(queryBuilder),
      range: jest.fn().mockReturnValue(queryBuilder),
      single: jest.fn().mockReturnValue(queryBuilder),
      maybeSingle: jest.fn().mockReturnValue(queryBuilder),
      // Execution
      then: jest.fn().mockImplementation((onfulfilled) => 
        Promise.resolve({ data: null, error: null }).then(onfulfilled)
      ),
      execute: jest.fn().mockResolvedValue({ data: null, error: null }),
    };
    return queryBuilder;
  };

  return {
    supabaseMobile: {
      from: jest.fn(() => createQueryBuilder()),
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
