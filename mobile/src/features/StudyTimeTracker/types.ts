export type TimerState = 'STOPPED' | 'STUDYING' | 'BREAK';

export interface TimerDisplayProps {
  time: number;
  timerState: TimerState;
}

export interface TimerControlsProps {
  timerState: TimerState;
  onStartStudy: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

export interface TimerStatsProps {
  totalStudyTime: number;
  totalBreakTime: number;
  currentTime: number;
  timerState: TimerState;
}
