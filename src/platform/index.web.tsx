import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WeeklyScheduleScreen } from './web-components/WeeklyScheduleScreen';
import { CourseScreen } from './web-components/CourseScreen';
import { DocumentsScreen } from './web-components/DocumentsScreen';
import { TimerScreen } from './web-components/TimerScreen';
import { AssistantScreen } from './web-components/AssistantScreen';
import { WelcomeHeader } from '../components/layout/WelcomeHeader';

export function AppRouter() {
  return (
    <Router>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <WelcomeHeader />
        
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-14">
              <div className="flex space-x-8 space-x-reverse">
                <Link to="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  לוח זמנים
                </Link>
                <Link to="/timer" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  טיימר
                </Link>
                <Link to="/course" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  קורס
                </Link>
                <Link to="/documents" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  מסמכים
                </Link>
                <Link to="/assistant" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  עוזר
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<WeeklyScheduleScreen />} />
            <Route path="/timer" element={<TimerScreen />} />
            <Route path="/course" element={<CourseScreen />} />
            <Route path="/documents" element={<DocumentsScreen />} />
            <Route path="/assistant" element={<AssistantScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
