declare module '@/components/theme/ThemeProvider' {
  export function useTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void };
  export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement;
}

declare module '@react-native-community/datetimepicker' {
  import { ViewStyle } from 'react-native';
  
  export interface DateTimePickerEvent {
    type: 'set' | 'dismissed' | 'neutralButtonPressed';
    nativeEvent: {
      timestamp?: number;
      utcOffset?: number;
    };
  }

  interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime' | 'countdown';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
    is24Hour?: boolean;
    textColor?: string;
    accentColor?: string;
    style?: ViewStyle;
  }

  export default function DateTimePicker(props: DateTimePickerProps): JSX.Element;
}

declare module 'react-native-toast-message' {
  interface ToastProps {
    type?: 'success' | 'error' | 'info';
    position?: 'top' | 'bottom';
    text1?: string;
    text2?: string;
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
  }

  const Toast: {
    show: (options: ToastProps) => void;
    hide: () => void;
  };

  export default Toast;
}

declare module '@/integrations/supabase/client' {
  import { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '@/types/supabase.generated';
  
  export const supabase: SupabaseClient<Database>;
}

declare module '@/types/journal' {
  import type { JournalEntry, JournalEntryUpdate } from '@/types/supabase.generated';

  export interface JournalEntryFormProps {
    onEntryAdded: () => void;
  }

  export interface JournalEntryCardProps {
    entry: JournalEntry;
    onEdit: (entry: JournalEntry) => void;
    onDelete: (id: string) => void;
  }

  export interface EditEntryModalProps {
    visible: boolean;
    entry: JournalEntry | null;
    onClose: () => void;
    onSave: (data: JournalEntryUpdate) => Promise<void>;
  }

  export interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
  }
}

declare module '@/types/calendar' {
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

  export type CalendarEventInsert = Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;
  export type CalendarEventUpdate = Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
}
