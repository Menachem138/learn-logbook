import { useState, useEffect, useCallback } from 'react';

export type TimerMode = 'learn' | 'break';

export function useTimer() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<TimerMode>('learn');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
  }, []);

  return {
    time,
    isActive,
    isPaused,
    mode,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setMode,
  };
}
