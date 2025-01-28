import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, StopCircle } from 'lucide-react';

interface TimerControlsProps {
  timerState: 'STOPPED' | 'STUDYING' | 'BREAK';
  onStartStudy: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  onStartStudy,
  onStartBreak,
  onStop,
}) => {
  return (
    <div className="flex justify-center space-x-2">
      <Button 
        onClick={onStartStudy} 
        disabled={timerState === 'STUDYING'}
        variant={timerState === 'STUDYING' ? "default" : "outline"}
        className="transition-all duration-300 ease-in-out hover:shadow-md"
      >
        {timerState === 'STUDYING' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        למידה
      </Button>
      <Button 
        onClick={onStartBreak} 
        disabled={timerState === 'BREAK'}
        variant={timerState === 'BREAK' ? "default" : "outline"}
        className="transition-all duration-300 ease-in-out hover:shadow-md"
      >
        {timerState === 'BREAK' ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
        הפסקה
      </Button>
      <Button 
        onClick={onStop} 
        disabled={timerState === 'STOPPED'} 
        variant="destructive"
        className="transition-all duration-300 ease-in-out hover:shadow-md"
      >
        <StopCircle className="mr-2 h-4 w-4" />
        עצור
      </Button>
    </div>
  );
};