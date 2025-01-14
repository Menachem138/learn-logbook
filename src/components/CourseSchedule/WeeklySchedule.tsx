import React from 'react';
import { DaySchedule as DayScheduleComponent } from '../CourseSchedule/DaySchedule';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DaySchedule } from './scheduleData';

interface WeeklyScheduleProps {
  schedule: DaySchedule[];
  onUpdateDay: (dayIndex: number, newSchedule: any[]) => void;
  onUpdateDayName: (dayIndex: number, newName: string) => void;
  onAddDay: () => void;
  onDeleteDay: (dayIndex: number) => void;
}

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  schedule,
  onUpdateDay,
  onUpdateDayName,
  onAddDay,
  onDeleteDay,
}) => {
  return (
    <div className="space-y-6">
      {schedule.map((day, index) => (
        <DayScheduleComponent
          key={index}
          day={day.day}
          schedule={day.schedule}
          onUpdateSchedule={(newSchedule) => onUpdateDay(index, newSchedule)}
          onUpdateDayName={(newName) => onUpdateDayName(index, newName)}
          onDeleteDay={() => onDeleteDay(index)}
        />
      ))}
      
      <Button 
        onClick={onAddDay}
        variant="outline" 
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        הוסף יום חדש
      </Button>
    </div>
  );
};

export default WeeklySchedule;