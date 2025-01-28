import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Grid, List } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

type CalendarHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddEvent: () => void;
};

export function CalendarHeader({ viewMode, onViewModeChange, onAddEvent }: CalendarHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'day' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('day')}
        >
          <List className="h-4 w-4 mr-2" />
          יום
        </Button>
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('week')}
        >
          <Grid className="h-4 w-4 mr-2" />
          שבוע
        </Button>
        <Button
          variant={viewMode === 'month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('month')}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          חודש
        </Button>
      </div>
      <Button onClick={onAddEvent}>הוסף אירוע</Button>
    </div>
  );
}