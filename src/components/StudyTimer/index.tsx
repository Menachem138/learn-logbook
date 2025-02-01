import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { TimerHistory } from "./TimerHistory";
import { TimerSummary } from "./TimerSummary";
import { HistoryToggle } from "./HistoryToggle";

export const StudyTimer = () => {
  const [timerState, setTimerState] = useState<'STOPPED' | 'STUDYING' | 'BREAK'>('STOPPED');
  const [time, setTime] = useState<number>(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const { session } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const loadSessions = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error loading sessions:', error);
      toast.error('שגיאה בטעינת ההיסטוריה');
      return;
    }

    setSessions(data || []);
    calculateTotalTimes(data || []);
  };

  const calculateTotalTimes = (sessionData: any[]) => {
    let studyTime = 0;
    let breakTime = 0;

    sessionData.forEach(session => {
      if (session.duration) {
        if (session.type === 'study') {
          studyTime += session.duration;
        } else if (session.type === 'break') {
          breakTime += session.duration;
        }
      }
    });

    setTotalStudyTime(studyTime);
    setTotalBreakTime(breakTime);
  };

  const startTimer = async (type: 'study' | 'break') => {
    if (!session?.user?.id) {
      toast.error('יש להתחבר כדי להשתמש בטיימר');
      return;
    }

    if (currentSessionId) {
      await stopTimer();
    }

    const { data, error } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: session.user.id,
        type,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting timer:', error);
      toast.error('שגיאה בהפעלת הטיימר');
      return;
    }

    setCurrentSessionId(data.id);
    setTimerState(type === 'study' ? 'STUDYING' : 'BREAK');
    setTime(0);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 1000);
    }, 1000);

    toast.success(type === 'study' ? 'התחלת זמן למידה!' : 'התחלת זמן הפסקה!');
  };

  const stopTimer = async () => {
    if (!session?.user?.id || !currentSessionId) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const { error } = await supabase
      .from('timer_sessions')
      .update({
        duration: time,
        ended_at: new Date().toISOString(),
      })
      .eq('id', currentSessionId);

    if (error) {
      console.error('Error stopping timer:', error);
      toast.error('שגיאה בעצירת הטיימר');
      return;
    }

    setTimerState('STOPPED');
    setTime(0);
    setCurrentSessionId(null);
    loadSessions();
    toast.info('הטיימר נעצר!');
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDiaryToggle = () => {
    setShowHistory(!showHistory);
    if (showSummary) setShowSummary(false);
  };

  const handleSummaryToggle = () => {
    setShowSummary(!showSummary);
    if (showHistory) setShowHistory(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
      <CardContent className="p-8 space-y-6">
        <TimerDisplay
          time={time}
          timerState={timerState}
          formatTime={formatTime}
        />

        <TimerControls
          timerState={timerState}
          onStartStudy={() => startTimer('study')}
          onStartBreak={() => startTimer('break')}
          onStop={stopTimer}
        />

        <HistoryToggle
          isOpen={showHistory || showSummary}
          onToggle={handleSummaryToggle}
          onDiaryToggle={handleDiaryToggle}
        />

        {showHistory && (
          <TimerHistory
            sessions={sessions}
            totalStudyTime={totalStudyTime}
            totalBreakTime={totalBreakTime}
            onCalculateSummary={() => setShowHistory(false)}
            onSessionsUpdate={loadSessions}
          />
        )}

        {showSummary && (
          <TimerSummary
            totalStudyTime={totalStudyTime}
            totalBreakTime={totalBreakTime}
            onClose={() => setShowSummary(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};