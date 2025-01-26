import React, { useState } from 'react';

const DEFAULT_SCHEDULE = [
  { time: '16:00–16:15', activity: 'הכנה מנטלית ופיזית' },
  { time: '16:15–17:00', activity: 'צפייה בפרק מהקורס וסיכומים' },
  { time: '17:00–17:10', activity: 'הפסקת ריענון קצרה' },
  { time: '17:10–18:00', activity: 'תרגול מעשי' },
  { time: '18:00–18:10', activity: 'הפסקה קצרה נוספת' },
  { time: '18:10–19:00', activity: 'חזרה על החומר וכתיבת שאלות פתוחות' },
];

const DAYS = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];

export function WeeklyScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(1); // Monday (שני) by default

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">לוח זמנים שבועי</h1>
      </header>

      <div className="flex overflow-x-auto bg-white border-b border-gray-200 p-4 space-x-4">
        {DAYS.map((day, index) => (
          <button
            key={day}
            className={`flex-shrink-0 px-6 py-2 rounded-xl border ${
              selectedDay === index 
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setSelectedDay(index)}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 space-y-4">
        {DEFAULT_SCHEDULE.map((item, index) => (
          <div key={index} className="flex bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="w-32 p-4 bg-gray-50 rounded-r-lg">
              <span className="text-gray-600">{item.time}</span>
            </div>
            <div className="flex-1 p-4">
              <p>{item.activity}</p>
            </div>
          </div>
        ))}

        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg w-full justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          הוסף משימה
        </button>
      </div>
    </div>
  );
}

// Styles are handled by Tailwind CSS classes
