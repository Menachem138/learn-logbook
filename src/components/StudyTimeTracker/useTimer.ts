
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TimerState } from './types';

export const useTimer = (userId?: string) => {
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const [time, setTime] = useState<number>(0);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startTimeRef = useRef<number>(0);
  const studyTimeRef = useRef<number>(0);
  const breakTimeRef = useRef<number>(0);
  const currentSessionRef = useRef<string | null>(null);

  const startTimer = useCallback(async (type: 'STUDYING' | 'BREAK') => {
    if (!userId) {
      toast({
        title: "התחברות נדרשת",
        description: "יש להתחבר כדי לעקוב אחר זמני הלמידה",
        variant: "destructive",
      });
      return;
    }

    const { data: newSession, error } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: userId,
        type: type.toLowerCase(),
        started_at: new Date().toISOString(),
        duration: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting timer session:', error);
      toast({
        title: "שגיאה בשמירת הנתונים",
        description: "לא ניתן לשמור את זמני הלמידה כרגע",
        variant: "destructive",
      });
      return;
    }

    currentSessionRef.current = newSession.id;
    setTimerState(type);
    startTimeRef.current = Date.now();
    setTime(0);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 10);
    }, 10);
  }, [userId, toast]);

  const stopTimer = useCallback(async () => {
    if (!userId || !currentSessionRef.current) return;

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

    const { error } = await supabase
      .from('timer_sessions')
      .update({ 
        ended_at: new Date().toISOString(),
        duration: elapsedTime
      })
      .eq('id', currentSessionRef.current);

    if (error) {
      console.error('Error stopping timer session:', error);
      toast({
        title: "שגיאה בשמירת הנתונים",
        description: "לא ניתן לשמור את זמני הלמידה כרגע",
        variant: "destructive",
      });
    }

    setTotalStudyTime(studyTimeRef.current);
    setTotalBreakTime(breakTimeRef.current);
    setTimerState('STOPPED');
    setTime(0);
    currentSessionRef.current = null;
  }, [userId, timerState, toast]);

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
