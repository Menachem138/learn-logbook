import React from 'react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/utils/timeUtils';

interface TimerSummaryProps {
  totalStudyTime: number;
  totalBreakTime: number;
  onClose: () => void;
}

export const TimerSummary: React.FC<TimerSummaryProps> = ({
  totalStudyTime,
  totalBreakTime,
  onClose,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">זמן למידה</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black rounded-full transition-all duration-300"
                style={{ width: `${Math.min((totalStudyTime / (totalStudyTime + totalBreakTime)) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span>זמן למידה</span>
              <span className="font-mono">{formatTime(totalStudyTime)}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onClose}
        className="w-full bg-gray-900 text-white hover:bg-gray-800"
      >
        הסתר סיכום
      </Button>
    </div>
  );
};