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
    <div className="flex justify-center gap-4 mb-8">
      <Button
        onClick={onStartStudy}
        disabled={timerState === 'STUDYING'}
        variant="outline"
        className="flex-1 max-w-[200px] bg-white hover:bg-gray-50 border-gray-300"
      >
        <Play className="ml-2 h-4 w-4" />
        למידה
      </Button>
      
      <Button
        onClick={onStartBreak}
        disabled={timerState === 'BREAK'}
        variant="outline"
        className="flex-1 max-w-[200px] bg-gray-400 hover:bg-gray-500 text-white border-0"
      >
        <Pause className="ml-2 h-4 w-4" />
        הפסקה
      </Button>
      
      <Button
        onClick={onStop}
        disabled={timerState === 'STOPPED'}
        className="flex-1 max-w-[200px] bg-red-500 hover:bg-red-600 text-white border-0"
      >
        <StopCircle className="ml-2 h-4 w-4" />
        עצור
      </Button>
    </div>
  );
};