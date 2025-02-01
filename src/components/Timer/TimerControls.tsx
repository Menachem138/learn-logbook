import React from 'react';
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  timerType: "study" | "break";
  onStartStudy: () => void;
  onStartBreak: () => void;
  onPause: () => void;
  onStop: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isPaused,
  timerType,
  onStartStudy,
  onStartBreak,
  onPause,
  onStop,
}) => {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      <Button
        onClick={onStartStudy}
        variant={timerType === "study" && isRunning ? "secondary" : "default"}
        className="timer-button"
      >
        זמן למידה
      </Button>
      <Button
        onClick={onStartBreak}
        variant={timerType === "break" && isRunning ? "secondary" : "default"}
        className="timer-button"
      >
        זמן הפסקה
      </Button>
      {isRunning && (
        <Button 
          onClick={onPause} 
          variant="outline"
          className="timer-button"
        >
          {isPaused ? "המשך" : "השהה"}
        </Button>
      )}
      <Button 
        onClick={onStop} 
        variant="destructive"
        className="timer-button"
      >
        עצור
      </Button>
    </div>
  );
};