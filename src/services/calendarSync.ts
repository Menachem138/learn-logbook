import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/integrations/supabase/client';
import type { CalendarEvent, CalendarEventInsert, CalendarEventUpdate } from '@/types/calendar.d';
import type { Database } from '@/types/supabase.generated';

const CALENDAR_STORAGE_KEY = '@calendar_events';
const LAST_SYNC_KEY = '@last_calendar_sync';

export async function syncCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Get last sync timestamp
    const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
    const lastSyncDate = lastSync ? new Date(lastSync) : new Date(0);

    // Fetch remote events that have been updated since last sync
    const { data: remoteEvents, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id, title, description, start_time, end_time, category, is_backup, completed, user_id, created_at, updated_at')
      .eq('user_id', session.session.user.id)
      .gt('updated_at', lastSyncDate.toISOString());

    if (fetchError) throw fetchError;

    // Get local events
    const localEventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    const localEvents: CalendarEvent[] = localEventsJson ? JSON.parse(localEventsJson) : [];

    // Merge remote and local events, with remote taking precedence
    const mergedEvents = [...localEvents];
    remoteEvents?.forEach(remoteEvent => {
      const localIndex = mergedEvents.findIndex(e => e.id === remoteEvent.id);
      if (localIndex >= 0) {
        mergedEvents[localIndex] = remoteEvent;
      } else {
        mergedEvents.push(remoteEvent);
      }
    });

    // Save merged events locally
    await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(mergedEvents));
    await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

    return mergedEvents;
  } catch (error) {
    console.error('Error syncing calendar events:', error);
    // On error, return cached events if available
    const cachedEvents = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    return cachedEvents ? JSON.parse(cachedEvents) : [];
  }
}

export async function addCalendarEvent(event: CalendarEventInsert): Promise<CalendarEvent | null> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    // Update local cache
    const localEventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    const localEvents: CalendarEvent[] = localEventsJson ? JSON.parse(localEventsJson) : [];
    localEvents.push(data);
    await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(localEvents));

    return data;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return null;
  }
}

export async function updateCalendarEvent(id: string, updates: CalendarEventUpdate): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    // Update local cache
    const localEventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    if (localEventsJson) {
      const localEvents: CalendarEvent[] = JSON.parse(localEventsJson);
      const eventIndex = localEvents.findIndex(e => e.id === id);
      if (eventIndex >= 0) {
        localEvents[eventIndex] = { ...localEvents[eventIndex], ...updates };
        await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(localEvents));
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
}

export async function deleteCalendarEvent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update local cache
    const localEventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    if (localEventsJson) {
      const localEvents: CalendarEvent[] = JSON.parse(localEventsJson);
      const filteredEvents = localEvents.filter(e => e.id !== id);
      await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(filteredEvents));
    }

    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}

export async function getLocalCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const eventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error('Error getting local calendar events:', error);
    return [];
  }
}
