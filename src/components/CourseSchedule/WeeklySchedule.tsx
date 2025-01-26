import React from 'react';
import { DaySchedule } from './scheduleData';
import { DaySchedule as DayScheduleComponent } from './DaySchedule';
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

export interface WeeklyScheduleProps {
  schedule: DaySchedule[];
  onUpdateDay: (dayIndex: number, newSchedule: any[]) => void;
  onUpdateDayName: (dayIndex: number, newName: string) => void;
  onAddDay: () => void;
  onDeleteDay: (dayIndex: number) => void;
}

export function WeeklySchedule({ 
  schedule, 
  onUpdateDay, 
  onUpdateDayName, 
  onAddDay, 
  onDeleteDay 
}: WeeklyScheduleProps) {
  return (
    <div className="space-y-4">
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
        variant="outline" 
        className="w-full mt-4 border-dashed"
        onClick={onAddDay}
      >
        <Plus className="h-4 w-4 mr-2" />
        הוסף יום חדש
      </Button>
    </div>
  );
}

export default WeeklySchedule;
