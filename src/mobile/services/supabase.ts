import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@mobile/config/env';
import type { Database } from '../../types/supabase';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'public',
    },
  }
);

// Helper functions for offline-first data handling
export const syncData = async (
  table: string,
  userId: string,
  offlineData: any[]
) => {
  try {
    const { data: remoteData, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    // Merge offline and remote data
    const mergedData = [...offlineData, ...remoteData!];
    const uniqueData = Array.from(
      new Map(mergedData.map(item => [item.id, item])).values()
    );

    // Store merged data locally
    await AsyncStorage.setItem(
      `@${table}_${userId}`,
      JSON.stringify(uniqueData)
    );

    return uniqueData;
  } catch (error) {
    console.error(`Error syncing ${table}:`, error);
    return offlineData;
  }
};

export const getOfflineData = async (
  table: string,
  userId: string
): Promise<any[]> => {
  try {
    const data = await AsyncStorage.getItem(`@${table}_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting offline ${table}:`, error);
    return [];
  }
};

export const saveOfflineData = async (
  table: string,
  userId: string,
  data: any
) => {
  try {
    const offlineData = await getOfflineData(table, userId);
    const updatedData = [...offlineData, { ...data, user_id: userId }];
    await AsyncStorage.setItem(
      `@${table}_${userId}`,
      JSON.stringify(updatedData)
    );
    return updatedData;
  } catch (error) {
    console.error(`Error saving offline ${table}:`, error);
    throw error;
  }
};
