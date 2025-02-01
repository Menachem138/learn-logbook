import React from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar } from 'lucide-react';

interface HistoryToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  onDiaryToggle: () => void;
}

export const HistoryToggle: React.FC<HistoryToggleProps> = ({ isOpen, onToggle, onDiaryToggle }) => {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <Button
        onClick={onToggle}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-gray-50 border-gray-300"
      >
        <BookOpen className="w-4 h-4" />
        סיכום
      </Button>
      <Button
        onClick={onDiaryToggle}
        variant="outline"
        className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-gray-50 border-gray-300"
      >
        <Calendar className="w-4 h-4" />
        יומן
      </Button>
    </div>
  );
};