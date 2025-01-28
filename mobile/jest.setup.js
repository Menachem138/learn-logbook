// Mock dependencies
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'test-token' }),
  AndroidImportance: {
    MAX: 'max',
  },
  scheduleNotificationAsync: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  modelId: 'test-device',
}));

// Mock Supabase client
jest.mock('./src/integrations/supabase/client', () => {
  const mockData = { id: 'test-session-id' };
  
  const createClient = () => {
    const client = {
      data: null,
      error: null,
      currentTable: null,
      
      from: jest.fn().mockImplementation((table) => {
        client.currentTable = table;
        return client;
      }),
      
      select: jest.fn().mockImplementation(() => client),
      
      insert: jest.fn().mockImplementation((data) => {
        client.data = {
          ...mockData,
          ...data,
          created_at: new Date().toISOString(),
        };
        return client;
      }),
      
      update: jest.fn().mockImplementation((data) => {
        client.data = {
          ...client.data,
          ...data,
          updated_at: new Date().toISOString(),
        };
        return client;
      }),
      
      eq: jest.fn().mockImplementation(() => client),
      
      single: jest.fn().mockImplementation(() => 
        Promise.resolve({ data: client.data, error: null })
      ),
      
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      })),
      
      removeChannel: jest.fn(),
    };
    
    return client;
  };
  
  return {
    supabaseMobile: createClient(),
  };
});
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
