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
    
    // Advance timer by 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    // Stop timer
    const stopButton = getByText('עצור');
    fireEvent.press(stopButton);
    
    // Verify Supabase was called to save the session
    expect(supabaseMobile.from).toHaveBeenCalledWith('timer_sessions');
  });

  it('updates study time in real-time', async () => {
    const { getByText } = render(<StudyTimeTracker />);
    
    // Start study timer
    fireEvent.press(getByText('למידה'));
    
    // Advance timer by 1 minute
    act(() => {
      jest.advanceTimersByTime(60000);
    });
    
    // Verify time display is updated
    expect(getByText('01:00.00')).toBeTruthy();
  });
});
