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
  export interface JournalEntryFormProps {
    onEntryAdded: () => void;
  }

  export interface JournalEntryCardProps {
    entry: import('@/types/supabase').JournalEntry;
    onEdit: (entry: import('@/types/supabase').JournalEntry) => void;
    onDelete: (id: string) => void;
  }

  export interface EditEntryModalProps {
    visible: boolean;
    entry: import('@/types/supabase').JournalEntry | null;
    onClose: () => void;
    onSave: (data: import('@/types/supabase').JournalEntryUpdate) => Promise<void>;
  }

  export interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
  }
}

declare module '@/types/supabase' {
  export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    user_id: string;
  }

  export type JournalEntryUpdate = Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
}

declare module '@/types/supabase.generated' {
  export interface Database {
    public: {
      Tables: {
        journal_entries: {
          Row: import('@/types/supabase').JournalEntry;
          Insert: Omit<import('@/types/supabase').JournalEntry, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<import('@/types/supabase').JournalEntry, 'id'>>;
        };
      };
    };
  }
}
