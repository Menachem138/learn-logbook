// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => {
  const mockData = { id: 'test-session-id' };
  const createClient = () => {
    const queryBuilder = {
      data: null,
      error: null,
      currentTable: null,
    };
    
    // Add methods that return the queryBuilder for chaining
    queryBuilder.from = jest.fn().mockImplementation((table) => {
      queryBuilder.currentTable = table;
      return queryBuilder;
    });
    
    queryBuilder.select = jest.fn().mockImplementation(() => {
      return queryBuilder;
    });
    
    queryBuilder.insert = jest.fn().mockImplementation((data) => {
      queryBuilder.data = {
        ...mockData,
        ...data,
        created_at: new Date().toISOString(),
      };
      return queryBuilder;
    });
    
    queryBuilder.update = jest.fn().mockImplementation((data) => {
      queryBuilder.data = {
        ...queryBuilder.data,
        ...data,
        updated_at: new Date().toISOString(),
      };
      return queryBuilder;
    });
    
    queryBuilder.eq = jest.fn().mockImplementation((column, value) => {
      if (queryBuilder.data && queryBuilder.data[column] === value) {
        return queryBuilder;
      }
      return queryBuilder;
    });
    
    queryBuilder.single = jest.fn().mockImplementation(() => {
      return Promise.resolve({ data: queryBuilder.data, error: null });
    });
    
    // Add promise-like behavior
    queryBuilder.then = jest.fn().mockImplementation((onfulfilled) => {
      return Promise.resolve({ data: queryBuilder.data, error: null }).then(onfulfilled);
    });

    return {
      from: queryBuilder.from,
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      })),
      removeChannel: jest.fn(),
    };
  };

  return {
    supabaseMobile: createClient(),
  };
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
        Promise.resolve({ data: queryBuilder.data, error: null }).then(onfulfilled)
      ),
      single: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: queryBuilder.data, error: null });
      }),
      execute: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: queryBuilder.data, error: null });
      }),
      then: jest.fn().mockImplementation((onfulfilled) => {
        return Promise.resolve({ data: queryBuilder.data, error: null }).then(onfulfilled);
      }),
    };
    return queryBuilder;
  };

  const queryBuilder = createQueryBuilder();
  return {
    supabaseMobile: {
      from: jest.fn().mockReturnValue(queryBuilder),
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
