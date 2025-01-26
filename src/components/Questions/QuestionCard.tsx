import React from 'react';
import { Question } from '../../integrations/supabase/types/questions';
import { Button } from '../../components/ui/button';
import { MessageSquareQuote, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

interface QuestionCardProps {
  question: Question;
  onAnswerClick: (questionId: string) => void;
  onDelete: (questionId: string) => void;
}

export const QuestionCard = ({ question, onAnswerClick, onDelete }: QuestionCardProps) => {
  return (
    <Card className="bg-background text-foreground transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg">{question.content}</CardTitle>
        <CardDescription>
          {new Date(question.created_at).toLocaleDateString('he-IL')}
        </CardDescription>
      </CardHeader>
      {question.answer && (
        <CardContent className="pt-4 border-t">
          <p className="font-semibold mb-2">תשובה:</p>
          <p>{question.answer}</p>
        </CardContent>
      )}
      <CardFooter className="pt-4 flex justify-between">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => onAnswerClick(question.id)}
        >
          <MessageSquareQuote className="h-4 w-4" />
          {question.answer ? 'ערוך תשובה' : 'הוסף תשובה'}
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 text-red-500 hover:text-red-600"
          onClick={() => onDelete(question.id)}
        >
          <Trash2 className="h-4 w-4" />
          מחק
        </Button>
      </CardFooter>
    </Card>
  );
};
