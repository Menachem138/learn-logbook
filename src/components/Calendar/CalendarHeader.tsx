
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

type CalendarHeaderProps = {
  onPrevMonth: () => void;
  onNextMonth: () => void;
  currentMonthDate: Date;
};

export function CalendarHeader({ onPrevMonth, onNextMonth, currentMonthDate }: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrevMonth}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <h2 className="text-xl font-semibold">
        {format(currentMonthDate, 'MMMM yyyy')}
      </h2>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
