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
  const studyTimeRef = useRef<number>(0);
  const breakTimeRef = useRef<number>(0);
  const currentSessionRef = useRef<string | null>(null);

  const showToast = (title: string, type: 'success' | 'error') => {
    Toast.show({
      type,
      text1: title,
      position: 'bottom',
      visibilityTime: 3000,
    });
  };

  const stopTimer = useCallback(async () => {
    if (!userId) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const elapsedTime = Date.now() - startTimeRef.current;
    
    if (timerState === 'STUDYING') {
      studyTimeRef.current += elapsedTime;
    } else if (timerState === 'BREAK') {
      breakTimeRef.current += elapsedTime;
    }

    if (currentSessionRef.current) {
      const { error } = await supabaseMobile
        .from('timer_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          duration: elapsedTime
        })
        .eq('id', currentSessionRef.current);

      if (error) {
        console.error('Error stopping timer session:', error);
        showToast('לא ניתן לשמור את זמני הלמידה כרגע', 'error');
      }
    }

    setTotalStudyTime(studyTimeRef.current);
    setTotalBreakTime(breakTimeRef.current);
    setTimerState('STOPPED');
    setTime(0);
    currentSessionRef.current = null;
  }, [userId, timerState]);

  const startTimer = useCallback(async (newState: 'STUDYING' | 'BREAK') => {
    if (!userId) {
      showToast('יש להתחבר כדי לעקוב אחר זמני הלמידה', 'error');
      return;
    }

    // Stop current timer if running
    if (timerState !== 'STOPPED') {
      await stopTimer();
    }

    // Start new session
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
      console.error('Error starting timer session:', error);
      showToast('לא ניתן לשמור את זמני הלמידה כרגע', 'error');
      return;
    }

    currentSessionRef.current = newSession.id;
    setTimerState(newState);
    startTimeRef.current = Date.now();
    setTime(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 10);
    }, 10);
  }, [userId, timerState, stopTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    time,
    timerState,
    totalStudyTime,
    totalBreakTime,
    startTimer,
    stopTimer
  };
};
