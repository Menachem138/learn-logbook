import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Trash2, Plus } from "lucide-react";
import { ScheduleItem } from "./scheduleData";

interface DayScheduleProps {
  day: string;
  schedule: ScheduleItem[];
  onUpdateSchedule: (schedule: ScheduleItem[]) => void;
  onUpdateDayName: (newName: string) => void;
  onDeleteDay: () => void;
}

export function DaySchedule({ day, schedule, onUpdateSchedule, onUpdateDayName, onDeleteDay }: DayScheduleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState<ScheduleItem[]>(schedule);
  const [editedDayName, setEditedDayName] = useState(day);
  const [isEditingDayName, setIsEditingDayName] = useState(false);

  const handleTimeChange = (index: number, value: string) => {
    const newSchedule = [...editedSchedule];
    newSchedule[index] = { ...newSchedule[index], time: value };
    setEditedSchedule(newSchedule);
  };

  const handleActivityChange = (index: number, value: string) => {
    const newSchedule = [...editedSchedule];
    newSchedule[index] = { ...newSchedule[index], activity: value };
    setEditedSchedule(newSchedule);
  };

  const handleAddTask = () => {
    const newTask: ScheduleItem = {
      time: "00:00–00:00",
      activity: "משימה חדשה"
    };
    const newSchedule = [...editedSchedule, newTask];
    setEditedSchedule(newSchedule);
    setIsEditing(true);
  };

  const handleDeleteTask = (index: number) => {
    const newSchedule = editedSchedule.filter((_, i) => i !== index);
    setEditedSchedule(newSchedule);
  };

  const handleSave = () => {
    onUpdateSchedule(editedSchedule);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSchedule(schedule);
    setIsEditing(false);
  };

  const handleSaveDayName = () => {
    onUpdateDayName(editedDayName);
    setIsEditingDayName(false);
  };

  const handleCancelDayName = () => {
    setEditedDayName(day);
    setIsEditingDayName(false);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="bg-muted/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {isEditingDayName ? (
            <div className="flex gap-2">
              <Input
                value={editedDayName}
                onChange={(e) => setEditedDayName(e.target.value)}
                className="w-32"
              />
              <Button variant="ghost" size="sm" onClick={handleSaveDayName}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelDayName}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-lg font-bold">{day}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditingDayName(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDeleteDay} className="hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {(isEditing ? editedSchedule : schedule).map((item, itemIndex) => (
            <li key={itemIndex} className="flex justify-between items-center py-2 border-b last:border-0">
              {isEditing ? (
                <>
                  <Input
                    value={item.time}
                    onChange={(e) => handleTimeChange(itemIndex, e.target.value)}
                    className="w-32 ml-2"
                  />
                  <Input
                    value={item.activity}
                    onChange={(e) => handleActivityChange(itemIndex, e.target.value)}
                    className="flex-1 mx-2"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteTask(itemIndex)}
                    className="hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="bg-primary/5">{item.time}</Badge>
                  <span className="flex-1 text-right mr-4">{item.activity}</span>
                </>
              )}
            </li>
          ))}
        </ul>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddTask}
          className="w-full mt-4 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          הוסף משימה חדשה
        </Button>
      </CardContent>
    </Card>
  );
}