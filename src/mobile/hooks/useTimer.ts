import { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TimerState = 'IDLE' | 'STUDYING' | 'BREAK';

interface TimerSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  type: 'STUDY' | 'BREAK';
}

export function useTimer(userId: string | undefined) {
  const [time, setTime] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('IDLE');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadTotalTimes();
  }, [userId]);

  const loadTotalTimes = async () => {
    if (!userId) return;

    try {
      const storedTimes = await AsyncStorage.getItem(`@timer_totals_${userId}`);
      if (storedTimes) {
        const { studyTime, breakTime } = JSON.parse(storedTimes);
        setTotalStudyTime(studyTime);
        setTotalBreakTime(breakTime);
      }

      const { data: sessions } = await supabase
        .from('timer_sessions')
        .select('duration, type')
        .eq('user_id', userId);

      if (sessions) {
        const studyTime = sessions
          .filter(s => s.type === 'STUDY')
          .reduce((acc, s) => acc + (s.duration || 0), 0);
        const breakTime = sessions
          .filter(s => s.type === 'BREAK')
          .reduce((acc, s) => acc + (s.duration || 0), 0);

        setTotalStudyTime(studyTime);
        setTotalBreakTime(breakTime);

        await AsyncStorage.setItem(
          `@timer_totals_${userId}`,
          JSON.stringify({ studyTime, breakTime })
        );
      }
    } catch (error) {
      console.error('Error loading timer totals:', error);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (session: Omit<TimerSession, 'id'>) => {
      const { data, error } = await supabase
        .from('timer_sessions')
        .insert([session])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timer_sessions'] });
      loadTotalTimes();
    },
  });

  const startTimer = useCallback((newState: TimerState) => {
    if (!userId || timerState !== 'IDLE') return;

    setTimerState(newState);
    setStartTime(new Date());
    setTime(0);
  }, [userId, timerState]);

  const stopTimer = useCallback(async () => {
    if (!userId || !startTime || timerState === 'IDLE') return;

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    if (timerState === 'STUDYING') {
      setTotalStudyTime(prev => prev + duration);
    } else if (timerState === 'BREAK') {
      setTotalBreakTime(prev => prev + duration);
    }

    await saveMutation.mutateAsync({
      user_id: userId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration,
      type: timerState === 'STUDYING' ? 'STUDY' : 'BREAK',
    });

    setTimerState('IDLE');
    setStartTime(null);
    setTime(0);
  }, [userId, startTime, timerState, saveMutation]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (timerState !== 'IDLE' && startTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        setTime(now.getTime() - startTime.getTime());
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerState, startTime]);

  return {
    time,
    timerState,
    totalStudyTime,
    totalBreakTime,
    startTimer,
    stopTimer,
  };
}
