import React from 'react';

interface TimerDisplayProps {
  time: number;
  formatTime: (seconds: number) => string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, formatTime }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">טיימר</h2>
      <div className="timer-display text-4xl font-mono mb-6">
        {formatTime(time)}
      </div>
    </div>
  );
};