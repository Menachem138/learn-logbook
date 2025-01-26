import React from 'react';

const COURSE_SECTIONS = [
  {
    title: 'מבוא לתכנות',
    progress: 80,
    lessons: [
      { title: 'מהו תכנות?', completed: true },
      { title: 'משתנים ופעולות בסיסיות', completed: true },
      { title: 'תנאים ולולאות', completed: false },
    ],
  },
  {
    title: 'פיתוח אפליקציות',
    progress: 30,
    lessons: [
      { title: 'סביבת פיתוח', completed: true },
      { title: 'ממשק משתמש בסיסי', completed: false },
      { title: 'ניהול מצב (State)', completed: false },
    ],
  },
];

export function CourseScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-900">תוכן הקורס</h1>
      </header>

      <div className="p-4 space-y-6">
        {COURSE_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${section.progress}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 min-w-[45px]">{section.progress}%</span>
              </div>
            </div>

            <div className="space-y-2">
              {section.lessons.map((lesson, lessonIndex) => (
                <button 
                  key={lessonIndex}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-md w-full text-right hover:bg-gray-100 transition-colors"
                >
                  <svg 
                    className={`w-6 h-6 ${lesson.completed ? 'text-green-500' : 'text-gray-400'}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {lesson.completed ? (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                  <span className={`flex-1 ${lesson.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {lesson.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
