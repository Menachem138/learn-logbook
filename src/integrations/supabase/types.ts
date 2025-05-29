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
      calendar_events: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          is_all_day: boolean | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_all_day?: boolean | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_all_day?: boolean | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
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
      documents: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string | null
          description: string | null
          file_size: number | null
          file_url: string | null
          id: string
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
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
          tags: string[] | null
          type: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          tags?: string[] | null
          type?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_important?: boolean | null
          tags?: string[] | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      library_items: {
        Row: {
          cloudinary_data: Json | null
          cloudinary_urls: Json | null
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
          cloudinary_urls?: Json | null
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
          cloudinary_urls?: Json | null
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
      notifications: {
        Row: {
          created_at: string | null
          event_id: string
          event_type: string
          id: string
          is_sent: boolean | null
          message: string
          phone_number: string
          scheduled_for: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          event_type: string
          id?: string
          is_sent?: boolean | null
          message: string
          phone_number: string
          scheduled_for: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          event_type?: string
          id?: string
          is_sent?: boolean | null
          message?: string
          phone_number?: string
          scheduled_for?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
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
      push_notifications: {
        Row: {
          body: string
          created_at: string | null
          device_token: string
          id: string
          notification_type: string
          scheduled_for: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          device_token: string
          id?: string
          notification_type: string
          scheduled_for: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          device_token?: string
          id?: string
          notification_type?: string
          scheduled_for?: string
          title?: string
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
      tasks: {
        Row: {
          attached_file: string | null
          attached_file_name: string | null
          attached_file_type: string | null
          color: string | null
          completed: boolean | null
          created_at: string | null
          deadline: string | null
          description: string | null
          due_date: string
          failed: boolean | null
          has_reminder: boolean | null
          id: string
          notes: string | null
          priority: string | null
          reminder_recurrence: string | null
          reminder_time: string | null
          scheduled_time: string | null
          title: string
          updated_at: string | null
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          attached_file?: string | null
          attached_file_name?: string | null
          attached_file_type?: string | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          due_date: string
          failed?: boolean | null
          has_reminder?: boolean | null
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_recurrence?: string | null
          reminder_time?: string | null
          scheduled_time?: string | null
          title: string
          updated_at?: string | null
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          attached_file?: string | null
          attached_file_name?: string | null
          attached_file_type?: string | null
          color?: string | null
          completed?: boolean | null
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          due_date?: string
          failed?: boolean | null
          has_reminder?: boolean | null
          id?: string
          notes?: string | null
          priority?: string | null
          reminder_recurrence?: string | null
          reminder_time?: string | null
          scheduled_time?: string | null
          title?: string
          updated_at?: string | null
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      timer_daily_summaries: {
        Row: {
          created_at: string
          date: string
          id: string
          sessions_completed: number | null
          total_break_time: number | null
          total_study_time: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          sessions_completed?: number | null
          total_break_time?: number | null
          total_study_time?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          sessions_completed?: number | null
          total_break_time?: number | null
          total_study_time?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      timer_sessions: {
        Row: {
          created_at: string
          duration: number
          ended_at: string | null
          id: string
          started_at: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number
          ended_at?: string | null
          id?: string
          started_at: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number
          ended_at?: string | null
          id?: string
          started_at?: string
          type?: string
          user_id?: string | null
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
      check_and_send_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_insert_policy_for_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
        | "image_album"
        | "image_gallery"
        | "gallery"
        | "audio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      library_item_type: [
        "note",
        "link",
        "image",
        "video",
        "whatsapp",
        "pdf",
        "question",
        "youtube",
        "image_album",
        "image_gallery",
        "gallery",
        "audio",
      ],
    },
  },
} as const
