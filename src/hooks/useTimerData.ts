import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';

export const useTimerData = () => {
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  const { toast } = useToast();
  const { session } = useAuth();

  const loadLatestSessionData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      // First, try to get today's summary
      let { data: summary, error: summaryError } = await supabase
        .from('timer_daily_summaries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', todayStr)
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw summaryError;
      }

      // Get all sessions for today to calculate current totals
      const { data: sessions, error: sessionsError } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('started_at', today.toISOString())
        .order('started_at', { ascending: true });

      if (sessionsError) throw sessionsError;

      let studyTime = 0;
      let breakTime = 0;

      sessions?.forEach(session => {
        if (!session.started_at) return;
        
        const startTime = new Date(session.started_at).getTime();
        const endTime = session.ended_at ? new Date(session.ended_at).getTime() : Date.now();
        const duration = endTime - startTime;

        if (session.type === 'study') {
          studyTime += duration;
        } else if (session.type === 'break') {
          breakTime += duration;
        }
      });

      // If we don't have a summary for today yet, create one
      if (!summary) {
        const { error: insertError } = await supabase
          .from('timer_daily_summaries')
          .insert({
            user_id: session.user.id,
            date: todayStr,
            total_study_time: studyTime,
            total_break_time: breakTime
          });

        if (insertError) throw insertError;
      } else {
        // Update the existing summary
        const { error: updateError } = await supabase
          .from('timer_daily_summaries')
          .update({
            total_study_time: studyTime,
            total_break_time: breakTime
          })
          .eq('id', summary.id);

        if (updateError) throw updateError;
      }

      setTotalStudyTime(studyTime);
      setTotalBreakTime(breakTime);

    } catch (error: any) {
      console.error('Error loading timer data:', error);
      toast({
        title: "שגיאה בטעינת נתוני הטיימר",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [session?.user?.id, toast]);

  useEffect(() => {
    loadLatestSessionData();
    const intervalId = setInterval(loadLatestSessionData, 5000);
    return () => clearInterval(intervalId);
  }, [loadLatestSessionData]);

  return {
    totalStudyTime,
    totalBreakTime,
    loadLatestSessionData
  };
};