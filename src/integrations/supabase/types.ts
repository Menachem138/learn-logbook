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
      achievements: {
        Row: {
          created_at: string | null
          description: string | null
          earned_at: string | null
          id: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          earned_at?: string | null
          id?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      content_items: {
        Row: {
          cloudinary_public_id: string | null
          cloudinary_url: string | null
          content: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          starred: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          cloudinary_url?: string | null
          content: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          starred?: boolean | null
          title?: string
          type: string
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          cloudinary_url?: string | null
          content?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          starred?: boolean | null
          title?: string
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
          image_url: string | null
          is_important: boolean | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          cloudinary_data: Json | null
          content: string
          created_at: string
          file_details: Json | null
          id: string
          is_starred: boolean | null
          title: string
          type: Database["public"]["Enums"]["library_item_type"]
          user_id: string
        }
        Insert: {
          cloudinary_data?: Json | null
          content: string
          created_at?: string
          file_details?: Json | null
          id?: string
          is_starred?: boolean | null
          title: string
          type: Database["public"]["Enums"]["library_item_type"]
          user_id: string
        }
        Update: {
          cloudinary_data?: Json | null
          content?: string
          created_at?: string
          file_details?: Json | null
          id?: string
          is_starred?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["library_item_type"]
          user_id?: string
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          completed_sections: string[] | null
          course_id: string
          created_at: string | null
          id: string
          last_activity: string | null
          total_sections: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_sections?: string[] | null
          course_id: string
          created_at?: string | null
          id?: string
          last_activity?: string | null
          total_sections: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_sections?: string[] | null
          course_id?: string
          created_at?: string | null
          id?: string
          last_activity?: string | null
          total_sections?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          answer: string | null
          content: string
          created_at: string
          id: string
          is_answered: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          content: string
          created_at?: string
          id?: string
          is_answered?: boolean | null
          type?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          content?: string
          created_at?: string
          id?: string
          is_answered?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          day_name: string
          id: string
          schedule: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          day_name: string
          id?: string
          schedule: Json
          user_id: string
        }
        Update: {
          created_at?: string
          day_name?: string
          id?: string
          schedule?: Json
          user_id?: string
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      timer_daily_summaries: {
        Row: {
          created_at: string
          date: string
          id: string
          total_break_time: number
          total_study_time: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_break_time?: number
          total_study_time?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_break_time?: number
          total_study_time?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          created_at: string
          duration: number | null
          ended_at: string | null
          id: string
          started_at: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      tweets: {
        Row: {
          created_at: string
          id: string
          tweet_id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tweet_id: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tweet_id?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          learning_goals: Json | null
          preferences: Json | null
          theme: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          learning_goals?: Json | null
          preferences?: Json | null
          theme?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          learning_goals?: Json | null
          preferences?: Json | null
          theme?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity: string | null
          longest_streak: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          longest_streak?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity?: string | null
          longest_streak?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      youtube_videos: {
        Row: {
          created_at: string | null
          id: string
          thumbnail_url: string
          title: string
          url: string
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          thumbnail_url: string
          title: string
          url: string
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          thumbnail_url?: string
          title?: string
          url?: string
          user_id?: string | null
          video_id?: string
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
      library_item_type:
        | "note"
        | "link"
        | "image"
        | "video"
        | "whatsapp"
        | "pdf"
        | "question"
        | "youtube"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
