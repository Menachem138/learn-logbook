import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { TimerHistory } from "./TimerHistory";

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [timerType, setTimerType] = useState<"study" | "break">("study");
  const [timerLog, setTimerLog] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { session } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);

  useEffect(() => {
    loadTimerHistory();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  const loadTimerHistory = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('timer_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error loading timer history:', error);
      return;
    }

    setTimerLog(data || []);
    calculateTotalTimes(data || []);
  };

  const calculateTotalTimes = (sessions: any[]) => {
    let studyTime = 0;
    let breakTime = 0;

    sessions.forEach(session => {
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

  const startTimer = async (type: "study" | "break") => {
    if (!session?.user?.id) {
      toast.error("יש להתחבר כדי להשתמש בטיימר");
      return;
    }

    if (isRunning) {
      await stopTimer();
    }

    const { data, error } = await supabase
      .from('timer_sessions')
      .insert({
        user_id: session.user.id,
        type,
        duration: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error starting timer session:', error);
      toast.error("שגיאה בהפעלת הטיימר");
      return;
    }

    setCurrentSessionId(data.id);
    setTimerType(type);
    setIsRunning(true);
    setIsPaused(false);
    setTime(0);
    toast.success(
      type === "study" ? "התחלת זמן למידה!" : "התחלת זמן הפסקה!"
    );
  };

  const stopTimer = async () => {
    if (!session?.user?.id || !currentSessionId) return;

    const { error } = await supabase
      .from('timer_sessions')
      .update({
        duration: time,
        ended_at: new Date().toISOString(),
      })
      .eq('id', currentSessionId);

    if (error) {
      console.error('Error stopping timer session:', error);
      toast.error("שגיאה בעצירת הטיימר");
      return;
    }

    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
    setCurrentSessionId(null);
    loadTimerHistory();
    toast.info("הטיימר נעצר!");
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? "הטיימר ממשיך!" : "הטיימר מושהה!");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('he-IL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="timer-container p-6 space-y-4 w-full">
      <TimerDisplay time={time} formatTime={formatTime} />
      
      <TimerControls
        isRunning={isRunning}
        isPaused={isPaused}
        timerType={timerType}
        onStartStudy={() => startTimer("study")}
        onStartBreak={() => startTimer("break")}
        onPause={pauseTimer}
        onStop={stopTimer}
      />

      <TimerHistory
        showHistory={showHistory}
        timerLog={timerLog}
        totalStudyTime={totalStudyTime}
        totalBreakTime={totalBreakTime}
        onToggleHistory={() => setShowHistory(!showHistory)}
        formatTime={formatTime}
        formatDate={formatDate}
      />
    </Card>
  );
}