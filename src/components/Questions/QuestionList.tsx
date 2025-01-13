import React from 'react';
import { Question } from '@/integrations/supabase/types/questions';
import { QuestionCard } from './QuestionCard';

interface QuestionListProps {
  questions: Question[];
  onAnswerClick: (questionId: string) => void;
  onDelete: (questionId: string) => void;
}

export const QuestionList = ({ questions, onAnswerClick, onDelete }: QuestionListProps) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        עדיין אין שאלות. אתה מוזמן להוסיף את השאלה הראשונה!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          onAnswerClick={onAnswerClick}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};