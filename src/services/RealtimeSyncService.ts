import { supabase } from '../config/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SyncConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onSync: (payload: any) => void;
}

export class RealtimeSyncService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  static async subscribe(config: SyncConfig): Promise<void> {
    const { table, event, filter, onSync } = config;
    const channelId = `${table}:${event}${filter ? `:${filter}` : ''}`;

    // Don't create duplicate subscriptions
    if (this.channels.has(channelId)) {
      console.log(`Already subscribed to ${channelId}`);
      return;
    }

    try {
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            filter,
          },
          (payload) => {
            console.log(`Received ${event} event for ${table}:`, payload);
            onSync(payload);
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${channelId}:`, status);
        });

      this.channels.set(channelId, channel);
    } catch (error) {
      console.error(`Failed to subscribe to ${channelId}:`, error);
      throw error;
    }
  }

  static async unsubscribe(table: string, event: string, filter?: string): Promise<void> {
    const channelId = `${table}:${event}${filter ? `:${filter}` : ''}`;
    const channel = this.channels.get(channelId);

    if (channel) {
      try {
        await channel.unsubscribe();
        this.channels.delete(channelId);
        console.log(`Unsubscribed from ${channelId}`);
      } catch (error) {
        console.error(`Failed to unsubscribe from ${channelId}:`, error);
        throw error;
      }
    }
  }

  static async unsubscribeAll(): Promise<void> {
    try {
      const promises = Array.from(this.channels.values()).map(channel => 
        channel.unsubscribe()
      );
      await Promise.all(promises);
      this.channels.clear();
      console.log('Unsubscribed from all channels');
    } catch (error) {
      console.error('Failed to unsubscribe from all channels:', error);
      throw error;
    }
  }

  // Helper method to subscribe to course progress changes
  static subscribeToCourseProgress(userId: string, onSync: (payload: any) => void): void {
    this.subscribe({
      table: 'course_progress',
      event: '*',
      filter: `user_id=eq.${userId}`,
      onSync,
    });
  }

  // Helper method to subscribe to journal entries
  static subscribeToJournalEntries(userId: string, onSync: (payload: any) => void): void {
    this.subscribe({
      table: 'journal_entries',
      event: '*',
      filter: `user_id=eq.${userId}`,
      onSync,
    });
  }

  // Helper method to subscribe to notification preferences
  static subscribeToNotificationPreferences(userId: string, onSync: (payload: any) => void): void {
    this.subscribe({
      table: 'notification_preferences',
      event: '*',
      filter: `user_id=eq.${userId}`,
      onSync,
    });
  }
}
