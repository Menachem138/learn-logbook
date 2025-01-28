import { useEffect } from 'react';
import { supabaseMobile } from '../integrations/supabase/client';
import { useAuth } from '../contexts/AuthProvider';

export const useRealtimeSync = () => {
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.user) return;

    const timerChannel = supabaseMobile
      .channel('timer-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_sessions',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Timer session update:', payload);
          // Handle timer session updates
        }
      )
      .subscribe();

    const summaryChannel = supabaseMobile
      .channel('summary-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'timer_daily_summaries',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Daily summary update:', payload);
          // Handle daily summary updates
        }
      )
      .subscribe();

    const journalChannel = supabaseMobile
      .channel('journal-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'learning_journal',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Journal update:', payload);
          // Handle learning journal updates
        }
      )
      .subscribe();

    return () => {
      supabaseMobile.removeChannel(timerChannel);
      supabaseMobile.removeChannel(summaryChannel);
      supabaseMobile.removeChannel(journalChannel);
    };
  }, [session?.user]);
};
