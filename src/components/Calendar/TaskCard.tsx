
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'urgent' | 'medium' | 'low';
  completed: boolean;
  user_id: string;
};

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (taskId: string, completed: boolean) => void;
};

const priorityColors = {
  urgent: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-green-500'
};

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm');
  };

  return (
    <Card className={`relative ${task.completed ? 'opacity-60' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h4 className={`font-semibold ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-gray-500">{task.description}</p>
            )}
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">
                {formatTime(task.due_date)}
              </p>
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleComplete(task.id, !task.completed)}
            >
              <Check className={`h-4 w-4 ${task.completed ? 'text-green-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
