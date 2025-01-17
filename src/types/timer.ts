/**
 * Represents the possible states of the study timer
 */
export enum TimerState {
  /** Timer is not running */
  STOPPED,
  /** Currently in a study session */
  STUDYING,
  /** Currently in a break session */
  BREAK
}

/**
 * Represents a timer session in the database
 */
export interface TimerSession {
  id: string;
  user_id: string;
  duration: number;
  type: 'study' | 'break';
  created_at: string;
}

/**
 * Timer session data for creating a new session
 */
export interface CreateTimerSession {
  user_id: string;
  duration: number;
  type: 'study' | 'break';
}
