import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
  title: string;
  value: string;
  onChange: (value: string) => void;
  submitLabel: string;
  questionType: 'general' | 'trading';
  onQuestionTypeChange: (type: 'general' | 'trading') => void;
}

export const QuestionDialog = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  value,
  onChange,
  submitLabel,
  questionType,
  onQuestionTypeChange
}: QuestionDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button
              type="button"
              variant={questionType === 'general' ? 'default' : 'outline'}
              onClick={() => onQuestionTypeChange('general')}
            >
              שאלה כללית
            </Button>
            <Button
              type="button"
              variant={questionType === 'trading' ? 'default' : 'outline'}
              onClick={() => onQuestionTypeChange('trading')}
            >
              שאלה ליועץ המסחר
            </Button>
          </div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="כתוב את התוכן כאן..."
            className="min-h-[100px]"
          />
          <Button type="submit">
            {submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};