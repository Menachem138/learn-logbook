import { supabase } from '@/config/supabase';
import { RealtimeSyncService } from './RealtimeSyncService';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  mood?: string;
  study_duration?: number;
  created_at: string;
  updated_at: string;
}

export class JournalService {
  private static syncInitialized = false;

  static async getEntries(userId: string): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get journal entries:', error);
      throw error;
    }
  }

  static async createEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: userId,
          ...entry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create journal entry:', error);
      throw error;
    }
  }

  static async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    }
  }

  static async deleteEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  }

  static initializeSync(userId: string, onJournalUpdate: (payload: any) => void): void {
    if (this.syncInitialized) return;
    
    RealtimeSyncService.subscribeToJournalEntries(userId, onJournalUpdate);
    this.syncInitialized = true;
  }

  static cleanup(): void {
    if (!this.syncInitialized) return;
    
    RealtimeSyncService.unsubscribe('journal_entries', '*');
    this.syncInitialized = false;
  }
}
