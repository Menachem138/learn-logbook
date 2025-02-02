import type { Database } from './supabase.generated';

export type Tables = Database['public']['Tables'];

// Document types
export type Document = Tables['documents']['Row'];
export type DocumentInsert = Tables['documents']['Insert'];
export type DocumentUpdate = Tables['documents']['Update'];

// Journal entry types
export type JournalEntry = Tables['journal_entries']['Row'];
export type JournalEntryInsert = Omit<Tables['journal_entries']['Insert'], 'created_at' | 'updated_at'>;
export type JournalEntryUpdate = Partial<Omit<Tables['journal_entries']['Insert'], 'created_at' | 'updated_at'>>;
