declare module '@/components/theme/ThemeProvider' {
  export function useTheme(): { theme: 'light' | 'dark' };
  export function ThemeProvider({ children }: { children: React.ReactNode }): JSX.Element;
}

declare module '@/integrations/supabase/client' {
  import { SupabaseClient } from '@supabase/supabase-js';
  import type { Database } from '@/types/supabase.generated';
  export const supabase: SupabaseClient<Database>;
}

declare module '@/types/journal' {
  export interface JournalEntryFormProps {
    onEntryAdded: () => void;
  }

  export interface JournalEntryCardProps {
    entry: import('@/types/supabase').JournalEntry;
    onEdit: (entry: import('@/types/supabase').JournalEntry) => void;
    onDelete: (id: string) => void;
  }

  export interface EditEntryModalProps {
    visible: boolean;
    entry: import('@/types/supabase').JournalEntry | null;
    onClose: () => void;
    onSave: (data: import('@/types/supabase').JournalEntryUpdate) => Promise<void>;
  }

  export interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
  }
}

declare module '@/types/supabase' {
  export interface JournalEntry {
    id: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    user_id: string;
  }

  export type JournalEntryUpdate = Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
}

declare module '@/types/supabase.generated' {
  export interface Database {
    public: {
      Tables: {
        journal_entries: {
          Row: import('@/types/supabase').JournalEntry;
          Insert: Omit<import('@/types/supabase').JournalEntry, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<import('@/types/supabase').JournalEntry, 'id'>>;
        };
      };
    };
  }
}
