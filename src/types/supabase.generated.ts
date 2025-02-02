export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          title: string;
          content: string;
          category: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
