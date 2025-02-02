export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category: 'לימודים' | 'עבודה' | 'אישי' | 'אחר';
  is_backup: boolean;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type CategoryType = CalendarEvent['category'];

export type CalendarEventInsert = Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;
export type CalendarEventUpdate = Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

export interface WeeklySchedule {
  [key: string]: CalendarEvent[];
}

export interface CalendarViewProps {
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
  onAddEvent: () => void;
}

export interface EventModalProps {
  visible: boolean;
  event?: CalendarEvent;
  onClose: () => void;
  onSave: (event: CalendarEventInsert | CalendarEventUpdate) => Promise<void>;
}

export interface DayScheduleProps {
  date: Date;
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
}

export interface DateTimePickerEvent {
  type: string;
  nativeEvent: {
    timestamp?: number;
    utcOffset?: number;
  };
}
