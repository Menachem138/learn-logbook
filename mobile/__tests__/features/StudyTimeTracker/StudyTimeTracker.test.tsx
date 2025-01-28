import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { StudyTimeTracker } from '../../../src/features/StudyTimeTracker';
import { AuthProvider } from '../../../src/contexts/AuthProvider';
import { supabaseMobile } from '../../../src/integrations/supabase/client';

// Mock Supabase client
jest.mock('../../../src/integrations/supabase/client', () => ({
  supabaseMobile: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    })),
    removeChannel: jest.fn(),
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

// Mock AuthProvider context
jest.mock('../../../src/contexts/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    session: {
      user: {
        id: 'test-user-id',
      },
    },
  }),
}));

// Increase timeout for all tests in this suite
jest.setTimeout(10000);

describe('StudyTimeTracker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    const { getByText } = render(<StudyTimeTracker />);
    expect(getByText('מעקב זמן למידה')).toBeTruthy();
  });

  it('starts and stops study timer correctly', async () => {
    const { getByText } = render(<StudyTimeTracker />);
    
    // Start study timer
    const startButton = getByText('למידה');
    fireEvent.press(startButton);
    
    // Advance timer by 5 seconds and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    
    // Stop timer and wait for updates
    const stopButton = getByText('עצור');
    await act(async () => {
      fireEvent.press(stopButton);
    });
    
    // Verify Supabase was called to save the session
    expect(supabaseMobile.from).toHaveBeenCalledWith('timer_sessions');
  });

  it('updates study time in real-time', async () => {
    const { getByText } = render(<StudyTimeTracker />);
    
    // Start study timer
    fireEvent.press(getByText('למידה'));
    
    // Advance timer by 1 minute and wait for updates
    await act(async () => {
      jest.advanceTimersByTime(60000);
      // Wait for next render cycle
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Verify time display is updated
    expect(getByText('01:00.00')).toBeTruthy();
  }, 15000); // Increase timeout to 15 seconds
});
