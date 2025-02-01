'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthProvider';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';
import { TimerStats } from './TimerStats';
import { useTimer } from './useTimer';

export const StudyTimeTracker: React.FC = () => {
  const { session } = useAuth();
  const timer = useTimer(session?.user?.id);

  return (
    <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-3xl font-bold text-gray-800">מעקב זמן למידה</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimerDisplay time={timer.time} timerState={timer.timerState} />
        <TimerControls
          timerState={timer.timerState}
          onStartStudy={() => timer.startTimer('STUDYING')}
          onStartBreak={() => timer.startTimer('BREAK')}
          onStop={timer.stopTimer}
        />
        <TimerStats
          totalStudyTime={timer.totalStudyTime}
          totalBreakTime={timer.totalBreakTime}
          currentTime={timer.time}
          timerState={timer.timerState}
        />
      </CardContent>
    </Card>
  );
};