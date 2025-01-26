import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export function WelcomeHeader() {
  const { user } = useAuth();
  const currentTime = new Date();
  const hours = currentTime.getHours();

  const getGreeting = () => {
    if (hours >= 5 && hours < 12) return 'בוקר טוב';
    if (hours >= 12 && hours < 17) return 'צהריים טובים';
    if (hours >= 17 && hours < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  return (
    <header className="bg-white shadow-sm p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-blue-500"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user?.full_name || 'תלמיד'}
              </h1>
              <p className="text-sm text-gray-500">
                המשך ללמוד ולהתקדם בקצב שלך
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              הוסף משימה
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              הגדרות
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
