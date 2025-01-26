import React, { useState, useEffect } from 'react';

export function TimerScreen() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'learn' | 'break'>('learn');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
  };
  const switchMode = () => setMode(mode === 'learn' ? 'break' : 'learn');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">טיימר למידה</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <div className="text-6xl font-mono font-bold text-gray-900">
          {formatTime(time)}
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleTimer}
            className={`px-6 py-3 rounded-lg font-medium ${
              isActive 
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isActive ? 'עצור' : 'התחל'}
          </button>
          
          <button
            onClick={resetTimer}
            className="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            אפס
          </button>

          <button
            onClick={switchMode}
            className={`px-6 py-3 rounded-lg font-medium ${
              mode === 'learn'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {mode === 'learn' ? 'למידה' : 'הפסקה'}
          </button>
        </div>

        <div className="flex gap-4 mt-8">
          <button className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
            סיכום
          </button>
          <button className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
            יומן
          </button>
        </div>
      </main>
    </div>
  );
}
