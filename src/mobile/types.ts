export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'exam' | 'assignment';
  start_time: string;
  end_time: string;
  description?: string;
  is_all_day: boolean;
  created_at?: string;
  updated_at?: string;
  user_id: string;
}

export interface TimerSession {
  id: string;
  user_id: string;
  duration: number;
  type: 'study' | 'break';
  started_at: string;
  ended_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad';
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  schedule?: {
    days: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[];
    time: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at?: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_type: string;
  size: number;
  created_at?: string;
  updated_at?: string;
}
