import { useState, useRef, useCallback, useEffect } from 'react';
import { supabaseMobile } from '../../integrations/supabase/client';
import Toast from 'react-native-toast-message';
import { TimerState } from './types';
export const useTimer = (userId?: string) => {
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const [time, setTime] = useState<number>(0);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentSessionRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Effect to handle cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Effect to handle timer updates
  useEffect(() => {
    // Skip if timer is stopped or no start time
    if (timerState === 'STOPPED' || !startTimeRef.current) {
      console.log('Timer not running:', {
        timerState,
        hasStartTime: !!startTimeRef.current,
        currentTime: Date.now()
      });
      return;
    }

    console.log('Starting timer:', {
      timerState,
      startTime: startTimeRef.current,
      currentTime: Date.now()
    });

    let frameId: number | null = null;

    // Create timer update function using requestAnimationFrame
    const updateTimer = () => {
      if (!mountedRef.current || timerState === 'STOPPED') {
        console.log('Timer update skipped:', {
          mounted: mountedRef.current,
          timerState,
          currentTime: Date.now()
        });
        return;
      }

      const now = Date.now();
      const elapsed = Math.max(0, now - startTimeRef.current);
      
      console.log('Timer tick:', {
        now,
        startTime: startTimeRef.current,
        elapsed,
        currentTime: time,
        timerState
      });

      // Update time state
      setTime(elapsed);

      // Schedule next update
      frameId = requestAnimationFrame(updateTimer);
    };

    // Start animation frame loop
    frameId = requestAnimationFrame(updateTimer);

    // Cleanup
    return () => {
      console.log('Cleaning up timer:', {
        timerState,
        time,
        hasFrame: !!frameId
      });
      
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [timerState]);

  const showToast = useCallback((title: string, type: 'success' | 'error') => {
    Toast.show({
      type,
      text1: title,
      position: 'bottom',
      visibilityTime: 3000,
    });
  }, []);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(async (): Promise<boolean> => {
    if (!userId || !currentSessionRef.current) {
      console.log('Cannot stop timer: no user ID or current session');
      return false;
    }

    try {
      // Clear interval and calculate final elapsed time
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      const elapsedTime = startTimeRef.current > 0 ? Date.now() - startTimeRef.current : 0;
      console.log('Stopping timer:', {
        elapsedTime,
        startTime: startTimeRef.current,
        currentTime: Date.now(),
        hasInterval: !!intervalRef.current
      });

      const { data, error } = await supabaseMobile
        .from('timer_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          duration: elapsedTime
        })
        .eq('id', currentSessionRef.current);

      if (error) {
        console.error('Error updating timer session:', error);
        showToast('לא ניתן לשמור את זמני הלמידה כרגע', 'error');
        return false;
      }

      if (!data) {
        console.error('No data returned from update operation');
        showToast('לא ניתן לשמור את זמני הלמידה כרגע', 'error');
        return false;
      }

      if (timerState === 'STUDYING') {
        setTotalStudyTime(prev => prev + elapsedTime);
      } else if (timerState === 'BREAK') {
        setTotalBreakTime(prev => prev + elapsedTime);
      }

      setTimerState('STOPPED');
      setTime(0);
      currentSessionRef.current = null;
      return true;
    } catch (error) {
      console.error('Error stopping timer session:', error);
      showToast('לא ניתן לשמור את זמני הלמידה כרגע', 'error');
      return false;
    }
  }, [userId, timerState, showToast, clearTimerInterval]);

  const startTimer = useCallback(async (newState: 'STUDYING' | 'BREAK'): Promise<boolean> => {
    if (!userId) {
      showToast('יש להתחבר כדי לעקוב אחר זמני הלמידה', 'error');
      return false;
    }

    try {
      // Stop current timer if running
      if (timerState !== 'STOPPED') {
        const stopped = await stopTimer();
        if (!stopped) return false;
      }

      // Create new session
      const { data: newSession, error } = await supabaseMobile
        .from('timer_sessions')
        .insert({
          user_id: userId,
          type: newState.toLowerCase(),
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        showToast('אירעה שגיאה בהפעלת הטיימר', 'error');
        setTimerState('STOPPED');
        return false;
      }

      if (!newSession) {
        console.error('No session data returned');
        showToast('אירעה שגיאה בהפעלת הטיימר', 'error');
        setTimerState('STOPPED');
        return false;
      }

      // Set initial state and refs
      const now = Date.now();
      startTimeRef.current = now;
      currentSessionRef.current = newSession.id;
      
      console.log('Setting initial state:', {
        newState,
        now,
        startTime: startTimeRef.current,
        currentSession: currentSessionRef.current
      });
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Update state
      setTimerState(newState);
      setTime(0); // Set initial time to 0
      
      // Force an immediate time update
      const initialElapsed = Math.max(0, Date.now() - startTimeRef.current);
      setTime(initialElapsed);
      
      console.log('Timer started successfully:', {
        startTime: startTimeRef.current,
        timerState: newState,
        currentTime: Date.now(),
        initialElapsed
      });
      
      return true;
    } catch (error) {
      console.error('Error starting timer:', error);
      showToast('אירעה שגיאה בהפעלת הטיימר', 'error');
      setTimerState('STOPPED');
      clearTimerInterval();
      return false;
    }
  }, [userId, timerState, stopTimer, showToast, clearTimerInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  // Create updateTimer function that can be exposed for testing
  const updateTimer = useCallback(() => {
    if (!mountedRef.current || timerState === 'STOPPED' || !startTimeRef.current) {
      console.log('Update skipped:', {
        mounted: mountedRef.current,
        timerState,
        hasStartTime: !!startTimeRef.current
      });
      return;
    }

    const now = Date.now();
    const elapsed = Math.max(0, now - startTimeRef.current);

    console.log('Manual timer update:', {
      now,
      startTime: startTimeRef.current,
      elapsed,
      currentTime: time,
      willUpdate: elapsed !== time
    });

    if (elapsed !== time) {
      setTime(elapsed);
    }
  }, [time, timerState]);

  return {
    time,
    timerState,
    totalStudyTime,
    totalBreakTime,
    startTimer,
    stopTimer,
    updateTimer // Expose for testing
  };
};
