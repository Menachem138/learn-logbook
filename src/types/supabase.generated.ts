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
          updated_at: string;
          user_id: string;
          cloudinary_public_id?: string;
          file_url?: string;
          file_size?: number;
          type?: string;
          description?: string;
        };
        Insert: {
          title: string;
          content: string;
          category: string;
          user_id: string;
          cloudinary_public_id?: string;
          file_url?: string;
          file_size?: number;
          type?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: string;
          user_id?: string;
          cloudinary_public_id?: string;
          file_url?: string;
          file_size?: number;
          type?: string;
          description?: string;
          updated_at?: string;
        };
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
        Insert: {
          title: string;
          content: string;
          tags: string[];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          tags?: string[];
          updated_at?: string;
        };
      };
    };
  };
}
