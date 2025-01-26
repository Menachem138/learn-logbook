import React from 'react';

const DOCUMENTS = [
  {
    title: 'סיכום שיעור ראשון',
    type: 'pdf',
    date: '25/01/2024',
    size: '1.2MB',
  },
  {
    title: 'מצגת מבוא',
    type: 'pptx',
    date: '24/01/2024',
    size: '3.5MB',
  },
  {
    title: 'תרגילי בית',
    type: 'docx',
    date: '23/01/2024',
    size: '500KB',
  },
];

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    case 'docx':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
    case 'pptx':
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 13v-1m4 1v-3m4 3V8M12 21l7-7V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2h5z"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
  }
};

export function DocumentsScreen() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">מסמכים</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-gray-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
          </svg>
          העלאת מסמך
        </button>
      </header>
      
      <div className="p-4 space-y-4">
        {DOCUMENTS.map((doc, index) => (
          <div key={index} className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-blue-600">
              {getFileIcon(doc.type)}
            </div>
            <div className="mr-4 flex-1">
              <h3 className="font-semibold text-gray-900">{doc.title}</h3>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>{doc.date}</span>
                <span>{doc.type.toUpperCase()}</span>
                <span>{doc.size}</span>
              </div>
            </div>
            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
