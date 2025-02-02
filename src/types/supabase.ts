import type { Database } from './supabase.generated';

// Document types
export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

// Journal Entry types
export type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
export type JournalEntryInsert = Database['public']['Tables']['journal_entries']['Insert'];
export type JournalEntryUpdate = Database['public']['Tables']['journal_entries']['Update'];

// Helper type for extracting table types
export type Tables = Database['public']['Tables'];
export type TableNames = keyof Tables;
