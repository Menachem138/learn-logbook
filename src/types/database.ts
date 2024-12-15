export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          title: string;
          url: string;
          thumbnail: string;
          video_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          url: string;
          thumbnail: string;
          video_id: string;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          title?: string;
          url?: string;
          thumbnail?: string;
          video_id?: string;
          created_at?: string;
          user_id?: string;
        };
      };
      study_goals: {
        Row: {
          id: string;
          description: string;
          completed: boolean;
          created_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          description: string;
          completed?: boolean;
          created_at?: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          description?: string;
          completed?: boolean;
          created_at?: string;
          user_id?: string;
        };
      };
    };
  };
}
