import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Coffee } from 'lucide-react';
import { formatTotalTime } from '@/utils/timeUtils';

interface TimerStatsProps {
  totalStudyTime: number;
  totalBreakTime: number;
  currentTime: number;
  timerState: 'STOPPED' | 'STUDYING' | 'BREAK';
}

export const TimerStats: React.FC<TimerStatsProps> = ({
  totalStudyTime,
  totalBreakTime,
  currentTime,
  timerState,
}) => {
  const totalTime = totalStudyTime + totalBreakTime + (timerState !== 'STOPPED' ? currentTime : 0);
  const studyPercentage = totalTime > 0 
    ? ((totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0)) / totalTime) * 100 
    : 0;

  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="summary" className="text-sm">סיכום</TabsTrigger>
        <TabsTrigger value="details" className="text-sm">פירוט</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>זמן למידה</span>
            <span className="font-semibold">
              {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
            </span>
          </div>
          <Progress value={studyPercentage} className="w-full h-2" />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="details" className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-green-100 p-3 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md">
            <span className="flex items-center text-green-800">
              <BookOpen className="mr-2 h-5 w-5" /> זמן למידה
            </span>
            <span className="font-semibold text-green-800">
              {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
            </span>
          </div>
          <div className="flex justify-between items-center bg-yellow-100 p-3 rounded-lg transition-all duration-300 ease-in-out hover:shadow-md">
            <span className="flex items-center text-yellow-800">
              <Coffee className="mr-2 h-5 w-5" /> זמן הפסקה
            </span>
            <span className="font-semibold text-yellow-800">
              {formatTotalTime(totalBreakTime + (timerState === 'BREAK' ? currentTime : 0))}
            </span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};