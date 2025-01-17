export * from './questions';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string
          user_id: string
          content: string
          answer: string | null
          is_answered: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          content: string
          answer?: string | null
          is_answered?: boolean
          created_at?: string
          id?: string
        }
        Update: {
          user_id?: string
          content?: string
          answer?: string | null
          is_answered?: boolean
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          id: string;
          user_id: string;
          duration: number;
          type: 'study' | 'break';
          created_at: string;
        }
        Insert: {
          user_id: string;
          duration: number;
          type: 'study' | 'break';
          created_at?: string;
          id?: string;
        }
        Update: {
          user_id?: string;
          duration?: number;
          type?: 'study' | 'break';
          created_at?: string;
          id?: string;
        }
        Relationships: []
      }
      content_items: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          starred: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          starred?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          starred?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_journal: {
        Row: {
          content: string
          created_at: string
          id: string
          is_important: boolean | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_important?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          content: string
          created_at: string
          file_details: Json | null
          id: string
          is_starred: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_details?: Json | null
          id?: string
          is_starred?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_details?: Json | null
          id?: string
          is_starred?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
