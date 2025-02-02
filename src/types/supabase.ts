import { Database } from './supabase.generated';

export type Tables = Database['public']['Tables'];

export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
}

export type DocumentInsert = Omit<Document, 'id' | 'created_at'>;
export type DocumentUpdate = Partial<DocumentInsert>;
