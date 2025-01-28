import { renderHook, act } from '@testing-library/react-native';
import { useTimer } from '../../../src/features/StudyTimeTracker/useTimer';
import { TimerState } from '../../../src/features/StudyTimeTracker/types';

// Mock Supabase client
jest.mock('../../../src/integrations/supabase/client', () => ({
  supabaseMobile: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: { id: 'test-session-id', started_at: new Date(1000000).toISOString() },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: { id: 'test-session-id', ended_at: new Date(1000000).toISOString() },
          error: null
        }))
      }))
    }))
  }
}));

describe('useTimer', () => {
  const mockUserId = 'test-user-id';
  
  // Debug helper to track timer state
  const debugTimerState = (result: any, label: string) => {
    console.log(`[${label}] Timer state:`, {
      time: result.current.time,
      timerState: result.current.timerState,
      totalStudyTime: result.current.totalStudyTime,
      totalBreakTime: result.current.totalBreakTime,
      systemTime: Date.now()
    });
  };
  
  beforeAll(() => {
    // Enable fake timers with a fixed start time
    const startTime = 1000000;
    jest.useFakeTimers({
      now: startTime,
      advanceTimers: true
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    // Reset to fixed start time before each test
    const startTime = 1000000;
    jest.setSystemTime(startTime);
    jest.clearAllMocks();
    jest.clearAllTimers();
    console.log('[Test Setup] Test environment initialized:', {
      systemTime: Date.now(),
      startTime
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    console.log('[Test Cleanup] Cleared all timers and mocks');
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTimer(mockUserId));
    
    expect(result.current.time).toBe(0);
    expect(result.current.timerState).toBe<TimerState>('STOPPED');
    expect(result.current.totalStudyTime).toBe(0);
    expect(result.current.totalBreakTime).toBe(0);
  });

  it('starts study timer successfully', async () => {
    // Set initial time
    const startTime = 1000000;
    jest.setSystemTime(startTime);
    
    const { result } = renderHook(() => useTimer(mockUserId));
    debugTimerState(result, 'Initial render');

    // Start timer
    await act(async () => {
      const success = await result.current.startTimer('STUDYING');
      expect(success).toBe(true);
    });

    // Verify initial state
    expect(result.current.timerState).toBe<TimerState>('STUDYING');
    expect(result.current.time).toBe(0);

    // Log initial state
    console.log('Initial timer state:', {
      time: result.current.time,
      timerState: result.current.timerState,
      systemTime: Date.now()
    });

    // Advance time in smaller increments to ensure timer updates
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        // Advance time by 100ms
        jest.advanceTimersByTime(100);
        
        // Run any pending timers
        jest.runOnlyPendingTimers();
        
        // Allow React state updates to process
        await Promise.resolve();
        
        console.log(`Timer state after ${(i + 1) * 100}ms:`, {
          time: result.current.time,
          timerState: result.current.timerState,
          systemTime: Date.now()
        });
      });

      // Verify time is increasing
      expect(result.current.time).toBeGreaterThanOrEqual(i * 100);
    }

    // Final verification
    expect(result.current.time).toBeGreaterThan(0);
    expect(result.current.timerState).toBe<TimerState>('STUDYING');
  });

  it('stops timer successfully', async () => {
    // Set initial time
    const startTime = 1000000;
    jest.setSystemTime(startTime);
    
    const { result } = renderHook(() => useTimer(mockUserId));

    // Start timer
    await act(async () => {
      const success = await result.current.startTimer('STUDYING');
      expect(success).toBe(true);
    });

    // Verify initial state
    expect(result.current.timerState).toBe<TimerState>('STUDYING');
    expect(result.current.time).toBe(0);

    // Wait for initial setup and first interval
    await act(async () => {
      // Initial state check
      expect(result.current.timerState).toBe<TimerState>('STUDYING');
      expect(result.current.time).toBe(0);
      
      // Log initial state
      console.log('Initial timer state:', {
        time: result.current.time,
        timerState: result.current.timerState,
        systemTime: Date.now()
      });

      // Advance time by 5 seconds and run timers
      jest.advanceTimersByTime(5000);
      
      // Wait for React to process state updates
      await Promise.resolve();
      
      // Log state after update
      console.log('Timer state after 5 seconds:', {
        time: result.current.time,
        timerState: result.current.timerState,
        systemTime: Date.now()
      });
      
      // Verify time has increased
      expect(result.current.time).toBeGreaterThan(0);
      expect(result.current.timerState).toBe<TimerState>('STUDYING');
    });

    // Verify time before stopping - allow small timing variations due to RAF
    expect(result.current.time).toBeGreaterThanOrEqual(4900);
    expect(result.current.time).toBeLessThanOrEqual(5100);

    // Stop timer
    await act(async () => {
      const success = await result.current.stopTimer();
      expect(success).toBe(true);
    });

    // Verify final state
    expect(result.current.timerState).toBe<TimerState>('STOPPED');
    expect(result.current.time).toBe(0);
    // Allow small timing variations for total study time
    expect(result.current.totalStudyTime).toBeGreaterThanOrEqual(4900);
    expect(result.current.totalStudyTime).toBeLessThanOrEqual(5100);
  });
});
