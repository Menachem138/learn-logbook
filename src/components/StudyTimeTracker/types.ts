export type TimerState = 'STOPPED' | 'STUDYING' | 'BREAK';

export interface TimerSession {
  id: string;
  user_id: string;
  type: string;
  duration: number;
  started_at: string;
  ended_at?: string;
}

export interface TimerContextType {
  time: number;
  timerState: TimerState;
  totalStudyTime: number;
  totalBreakTime: number;
  startTimer: (state: 'STUDYING' | 'BREAK') => Promise<void>;
  stopTimer: () => Promise<void>;
}