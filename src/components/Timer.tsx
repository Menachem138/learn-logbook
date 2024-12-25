import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimerEntry {
  type: "study" | "break";
  duration: number;
  timestamp: Date;
}

interface TimerSession {
  id: string;
  type: string;
  duration: number;
  started_at: string;
  ended_at: string | null;
}

export default function Timer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [timerType, setTimerType] = useState<"study" | "break">("study");
  const [timerLog, setTimerLog] = useState<TimerSession[]>([]);
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

  const calculateTotalTimes = (sessions: TimerSession[]) => {
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
    <Card className="p-6 space-y-4 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">טיימר</h2>
        <div className="text-4xl font-mono mb-6">{formatTime(time)}</div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            onClick={() => startTimer("study")}
            variant={timerType === "study" && isRunning ? "secondary" : "default"}
          >
            זמן למידה
          </Button>
          <Button
            onClick={() => startTimer("break")}
            variant={timerType === "break" && isRunning ? "secondary" : "default"}
          >
            זמן הפסקה
          </Button>
          {isRunning && (
            <Button onClick={pauseTimer} variant="outline">
              {isPaused ? "המשך" : "השהה"}
            </Button>
          )}
          <Button onClick={stopTimer} variant="destructive">
            עצור
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="ghost"
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between mb-2"
        >
          <span>היסטוריית זמנים</span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {showHistory && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {timerLog.map((session) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center p-2 bg-muted rounded"
                >
                  <span>
                    {session.type === "study" ? "למידה" : "הפסקה"} -{" "}
                    {formatTime(session.duration || 0)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(session.started_at)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">סיכום זמנים</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>סה"כ זמן למידה:</span>
                  <span>{formatTime(totalStudyTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>סה"כ זמן הפסקות:</span>
                  <span>{formatTime(totalBreakTime)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}