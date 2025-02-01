import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Database } from '@/integrations/supabase/types';

type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];
type ProgressTracking = Database['public']['Tables']['progress_tracking']['Row'];

interface StudyStats {
  total_study_time: number;
  average_session_length: number;
  total_sessions: number;
  completion_rate: number;
  daily_stats: {
    date: string;
    minutes: number;
  }[];
}

export const StudyStatistics: React.FC = () => {
  const [stats, setStats] = useState<StudyStats>({
    total_study_time: 0,
    average_session_length: 0,
    total_sessions: 0,
    completion_rate: 0,
    daily_stats: []
  });
  const { session } = useAuth();

  useEffect(() => {
    const fetchStudyStats = async () => {
      if (!session?.user?.id) return;

      // Fetch timer sessions for study time calculations
      const { data: timerSessions, error: timerError } = await supabase
        .from('timer_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .returns<TimerSession[]>();

      if (timerError) {
        console.error('Error fetching timer sessions:', timerError);
        return;
      }

      // Calculate daily stats
      const dailyStats = timerSessions?.reduce((acc: { [key: string]: number }, session) => {
        const date = new Date(session.created_at).toLocaleDateString('he-IL');
        acc[date] = (acc[date] || 0) + (session.duration || 0);
        return acc;
      }, {});

      // Calculate average session length
      const totalTime = timerSessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0;
      const averageLength = timerSessions?.length ? totalTime / timerSessions.length : 0;

      // Fetch progress data for completion rate
      const { data: progress, error: progressError } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', session.user.id)
        .returns<ProgressTracking[]>();

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        return;
      }

      // Calculate completion rate
      const completionRate = progress?.reduce((sum, p) => {
        return sum + (p.completed_sections.length / p.total_sections);
      }, 0) || 0;

      setStats({
        total_study_time: totalTime,
        average_session_length: averageLength,
        total_sessions: timerSessions?.length || 0,
        completion_rate: (completionRate / (progress?.length || 1)) * 100,
        daily_stats: Object.entries(dailyStats || {}).map(([date, minutes]) => ({
          date,
          minutes: Number(minutes)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      });
    };

    fetchStudyStats();
  }, [session?.user?.id]);

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 rtl" dir="rtl">
      <h2 className="text-2xl font-bold">סטטיסטיקות למידה</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">זמן למידה כולל</h3>
            <p className="text-2xl font-bold">{formatMinutes(stats.total_study_time)}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">אורך שיעור ממוצע</h3>
            <p className="text-2xl font-bold">{formatMinutes(stats.average_session_length)}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">מספר שיעורים</h3>
            <p className="text-2xl font-bold">{stats.total_sessions}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold">אחוז השלמה</h3>
            <p className="text-2xl font-bold">{Math.round(stats.completion_rate)}%</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">זמן למידה יומי</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.daily_stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" fill="#4f46e5" name="דקות למידה" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StudyStatistics;
