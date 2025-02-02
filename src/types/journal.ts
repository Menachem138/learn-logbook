import type { JournalEntry, JournalEntryUpdate } from './supabase';

export interface JournalEntryFormProps {
  onEntryAdded: () => void;
}

export interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export interface EditEntryModalProps {
  visible: boolean;
  entry: JournalEntry | null;
  onClose: () => void;
  onSave: (data: JournalEntryUpdate) => Promise<void>;
}

export interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}
