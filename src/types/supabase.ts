import type { Database } from './supabase.generated';

// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
export type DocumentInsert = Omit<Document, 'id' | 'created_at' | 'updated_at'>;
export type DocumentUpdate = Partial<Omit<Document, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;

// Journal Entry types
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];

// Helper type for extracting table types
export type Tables = Database['public']['Tables'];
export type TableNames = keyof Tables;
