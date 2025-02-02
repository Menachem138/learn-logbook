import { Database } from './supabase.generated';

export type Tables = Database['public']['Tables'];
export type Document = Tables['documents']['Row'];
export type DocumentInsert = Tables['documents']['Insert'];
export type DocumentUpdate = Tables['documents']['Update'];
