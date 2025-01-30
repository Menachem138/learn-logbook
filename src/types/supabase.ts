export interface Database {
  public: {
    Tables: {
      learning_journal: {
        Row: {
          id: string;
          content: string;
          created_at: string;
          is_important: boolean;
          tags?: string[];
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['learning_journal']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['learning_journal']['Insert']>;
      };
      timer_sessions: {
        Row: {
          id: string;
          duration: number;
          type: 'study' | 'break';
          started_at: string;
          ended_at?: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timer_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['timer_sessions']['Insert']>;
      };
      calendar_events: {
        Row: {
          id: string;
          title: string;
          date: string;
          type: 'study' | 'exam' | 'assignment';
          start_time: string;
          end_time: string;
          description?: string;
          is_all_day: boolean;
          user_id: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['calendar_events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['calendar_events']['Insert']>;
      };
      courses: {
        Row: {
          id: string;
          title: string;
          schedule: {
            day: string;
            time: string;
          }[];
          progress: number;
          total_units: number;
          user_id: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['courses']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          content: string;
          role: 'user' | 'assistant';
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          title: string;
          file_url: string;
          file_type: string;
          user_id: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
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
