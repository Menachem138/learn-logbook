import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type TableSubscription = {
  table: string;
  onUpdate?: (newData: Record<string, unknown>) => void;
  onDelete?: (oldData: Record<string, unknown>) => void;
  onInsert?: (newData: Record<string, unknown>) => void;
};

class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private channels: Map<string, RealtimeChannel> = new Map();

  private constructor() {}

  static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  subscribeToTable({ table, onUpdate, onDelete, onInsert }: TableSubscription) {
    if (this.channels.has(table)) {
      console.warn(`Already subscribed to ${table}`);
      return;
    }

    const channel = supabase
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          switch (payload.eventType) {
            case 'UPDATE':
              onUpdate?.(payload.new);
              break;
            case 'DELETE':
              onDelete?.(payload.old);
              break;
            case 'INSERT':
              onInsert?.(payload.new);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${table}:`, status);
      });

    this.channels.set(table, channel);
  }

  unsubscribeFromTable(table: string) {
    const channel = this.channels.get(table);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(table);
    }
  }

  subscribeToUserSpecificData(userId: string) {
    // Subscribe to course progress
    this.subscribeToTable({
      table: 'course_progress',
      onUpdate: (newData) => {
        if (newData.user_id === userId) {
          // Emit event for course progress update
          window.dispatchEvent(new CustomEvent('courseProgressUpdate', { detail: newData }));
        }
      },
    });

    // Subscribe to journal entries
    this.subscribeToTable({
      table: 'journal_entries',
      onUpdate: (newData) => {
        if (newData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('journalEntryUpdate', { detail: newData }));
        }
      },
      onInsert: (newData) => {
        if (newData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('journalEntryCreate', { detail: newData }));
        }
      },
      onDelete: (oldData) => {
        if (oldData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('journalEntryDelete', { detail: oldData }));
        }
      },
    });

    // Subscribe to documents
    this.subscribeToTable({
      table: 'documents',
      onUpdate: (newData) => {
        if (newData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('documentUpdate', { detail: newData }));
        }
      },
      onInsert: (newData) => {
        if (newData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('documentCreate', { detail: newData }));
        }
      },
      onDelete: (oldData) => {
        if (oldData.user_id === userId) {
          window.dispatchEvent(new CustomEvent('documentDelete', { detail: oldData }));
        }
      },
    });
  }

  unsubscribeFromAll() {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }
}

export const realtimeSync = RealtimeSyncService.getInstance();
