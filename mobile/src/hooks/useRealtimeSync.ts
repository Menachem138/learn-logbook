import { useEffect, useRef } from 'react';
import { supabaseMobile } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthProvider';

export const useRealtimeSync = () => {
  const { session } = useAuth();
  const channelsRef = useRef([]);

  useEffect(() => {
    if (!session?.user) return;

    const setupChannel = (name, table) => {
      const channel = supabaseMobile.channel(name);
      channelsRef.current.push(channel);
      
      return channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log(`${name} update:`, payload);
          }
        )
        .subscribe();
    };

    try {
      setupChannel('timer-updates', 'timer_sessions');
      setupChannel('summary-updates', 'timer_daily_summaries');
      setupChannel('journal-updates', 'learning_journal');
    } catch (error) {
      console.error('Error setting up realtime channels:', error);
      channelsRef.current.forEach(channel => {
        try {
          supabaseMobile.removeChannel(channel);
        } catch (e) {
          console.error('Error removing channel during error cleanup:', e);
        }
      });
    }

    return () => {
      const channels = channelsRef.current;
      channelsRef.current = [];
      
      channels.forEach(channel => {
        try {
          supabaseMobile.removeChannel(channel);
        } catch (error) {
          console.error('Error removing channel during cleanup:', error);
        }
      });
    };
  }, [session?.user]);
};
