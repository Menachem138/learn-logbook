import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WeeklyScheduleScreen } from './web-components/WeeklyScheduleScreen';
import { CourseScreen } from './web-components/CourseScreen';
import { DocumentsScreen } from './web-components/DocumentsScreen';
import { TimerScreen } from './web-components/TimerScreen';
import { AssistantScreen } from './web-components/AssistantScreen';

export function AppRouter() {
  return (
    <Router>
      <div dir="rtl" className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <a href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  לוח זמנים
                </a>
                <a href="/timer" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  טיימר
                </a>
                <a href="/course" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  קורס
                </a>
                <a href="/documents" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  מסמכים
                </a>
                <a href="/assistant" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900">
                  עוזר
                </a>
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
