export interface Database {
  public: {
    Tables: {
      library_items: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_url: string;
          pdf_url: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: Omit<LibraryItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<LibraryItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      journal_entries: {
        Row: {
          id: string;
          title: string;
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          category: 'לימודים' | 'עבודה' | 'אישי' | 'אחר';
          is_backup: boolean;
          completed: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      notification_tokens: {
        Row: {
          id: string;
          token: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<NotificationToken, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NotificationToken, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type LibraryItem = Database['public']['Tables']['library_items']['Row'];
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type NotificationToken = Database['public']['Tables']['notification_tokens']['Row'];
