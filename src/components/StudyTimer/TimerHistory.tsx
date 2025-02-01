import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/timeUtils';
import { Book, Coffee, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TimerSession {
  id: string;
  type: string;
  duration: number;
  started_at: string;
}

interface TimerHistoryProps {
  sessions: TimerSession[];
  totalStudyTime: number;
  totalBreakTime: number;
  onCalculateSummary: () => void;
  onSessionsUpdate: () => void;
}

export const TimerHistory: React.FC<TimerHistoryProps> = ({
  sessions,
  onCalculateSummary,
  onSessionsUpdate,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('timer_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast.success('הטיימר נמחק בהצלחה');
      onSessionsUpdate();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('שגיאה במחיקת הטיימר');
    }
  };

  const deleteAllSessionsByDate = async (date: string) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { error } = await supabase
        .from('timer_sessions')
        .delete()
        .gte('started_at', startOfDay.toISOString())
        .lte('started_at', endOfDay.toISOString());

      if (error) throw error;

      toast.success('כל הטיימרים של היום נמחקו בהצלחה');
      onSessionsUpdate();
    } catch (error) {
      console.error('Error deleting sessions:', error);
      toast.error('שגיאה במחיקת הטיימרים');
    }
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups: { [key: string]: TimerSession[] }, session) => {
    const date = new Date(session.started_at).toLocaleDateString('he-IL');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  return (
    <div className="space-y-4">
      <div className="space-y-4 max-h-[300px] overflow-y-auto">
        {Object.entries(groupedSessions).map(([date, dateSessions]) => (
          <div key={date} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{date}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => deleteAllSessionsByDate(new Date(dateSessions[0].started_at).toISOString())}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                מחק את כל הטיימרים של היום
              </Button>
            </div>
            {dateSessions.map((session) => (
              <div
                key={session.id}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  session.type === 'study' ? 'bg-green-50' : 'bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {session.type === 'study' ? (
                    <Book className="h-4 w-4 text-green-600" />
                  ) : (
                    <Coffee className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>{formatDate(session.started_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-left tabular-nums">{formatTime(session.duration || 0)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteSession(session.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <Button
        onClick={onCalculateSummary}
        className="w-full bg-gray-900 text-white hover:bg-gray-800"
      >
        הסתר היסטוריה
      </Button>
    </div>
  );
};