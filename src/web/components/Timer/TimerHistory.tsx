import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TimerSession {
  id: string;
  type: string;
  duration: number;
  started_at: string;
}

interface TimerHistoryProps {
  showHistory: boolean;
  timerLog: TimerSession[];
  totalStudyTime: number;
  totalBreakTime: number;
  onToggleHistory: () => void;
  formatTime: (seconds: number) => string;
  formatDate: (dateString: string) => string;
}

export const TimerHistory: React.FC<TimerHistoryProps> = ({
  showHistory,
  timerLog,
  totalStudyTime,
  totalBreakTime,
  onToggleHistory,
  formatTime,
  formatDate,
}) => {
  return (
    <div className="mt-6">
      <Button
        variant="ghost"
        onClick={onToggleHistory}
        className="w-full flex items-center justify-between mb-2 text-[hsl(var(--timer-text))]"
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
                className="flex justify-between items-center p-2 bg-[hsl(var(--timer-stats-background))] text-[hsl(var(--timer-stats-text))] rounded"
              >
                <span>
                  {session.type === "study" ? "למידה" : "הפסקה"} -{" "}
                  {formatTime(session.duration || 0)}
                </span>
                <span className="text-sm">
                  {formatDate(session.started_at)}
                </span>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-[hsl(var(--timer-stats-background))] rounded-lg">
            <h3 className="font-semibold mb-2 text-[hsl(var(--timer-stats-text))]">סיכום זמנים</h3>
            <div className="space-y-1 text-[hsl(var(--timer-stats-text))]">
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
  );
};