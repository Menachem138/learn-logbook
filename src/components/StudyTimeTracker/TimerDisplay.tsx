import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface TimerDisplayProps {
  time: number;
  timerState: 'STOPPED' | 'STUDYING' | 'BREAK';
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, timerState }) => {
  const getBgColor = () => {
    switch (timerState) {
      case 'STUDYING':
        return 'bg-green-100';
      case 'BREAK':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="relative">
      <div className={`w-full py-8 px-4 rounded-2xl ${getBgColor()} transition-colors duration-300 ease-in-out shadow-inner`}>
        <div className="relative z-10 text-7xl font-bold text-center tabular-nums" dir="ltr">
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};