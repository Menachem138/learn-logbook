import React from 'react';

interface TimerDisplayProps {
  time: number;
  timerState: 'STOPPED' | 'STUDYING' | 'BREAK';
  formatTime: (time: number) => string;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, timerState, formatTime }) => {
  const getBgColor = () => {
    switch (timerState) {
      case 'STUDYING':
        return 'bg-[#E8F5E9]'; // Light green for study mode
      case 'BREAK':
        return 'bg-[#FFF8E1]'; // Light yellow for break mode
      default:
        return 'bg-[#F5F5F5]'; // Light gray for stopped state
    }
  };

  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-6">מעקב זמן למידה</h2>
      <div className={`${getBgColor()} rounded-2xl p-8 transition-colors duration-300`}>
        <div className="text-6xl font-bold tracking-wider font-mono" dir="ltr">
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};