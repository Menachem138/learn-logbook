
import React, { useState, useEffect } from 'react';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'urgent' | 'medium' | 'low';
  is_completed: boolean;
  user_id: string;
};

const defaultTask = {
  id: '',
  title: '',
  description: '',
  due_date: new Date().toISOString(),
  priority: 'medium' as const,
  is_completed: false,
  user_id: '' // Add the missing user_id property
};

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task>(defaultTask);
  const [isEditMode, setIsEditMode] = useState(false);
  const queryClient = useQueryClient();

  // Query to fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast.error('יש להתחבר כדי לצפות במשימות');
        return [];
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('due_date', { ascending: true });
        
      if (error) {
        toast.error('שגיאה בטעינת המשימות');
        console.error(error);
        return [];
      }
      
      return data as Task[];
    }
  });

  // Mutations for tasks
  const createTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'user_id'>) => {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        throw new Error('יש להתחבר כדי להוסיף משימה');
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...task, user_id: session.session.user.id }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('המשימה נוספה בהצלחה');
      setIsTaskModalOpen(false);
    },
    onError: (error) => {
      toast.error(`שגיאה בהוספת משימה: ${error.message}`);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const { id, user_id, ...updateData } = task;
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('המשימה עודכנה בהצלחה');
      setIsTaskModalOpen(false);
    },
    onError: (error) => {
      toast.error(`שגיאה בעדכון המשימה: ${error.message}`);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      return taskId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('המשימה נמחקה בהצלחה');
    },
    onError: (error) => {
      toast.error(`שגיאה במחיקת המשימה: ${error.message}`);
    }
  });

  const toggleTaskCompleteMutation = useMutation({
    mutationFn: async ({ taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('סטטוס המשימה עודכן בהצלחה');
    },
    onError: (error) => {
      toast.error(`שגיאה בעדכון סטטוס המשימה: ${error.message}`);
    }
  });

  // Functions to handle task operations
  const handleAddTask = () => {
    setCurrentTask({
      ...defaultTask,
      due_date: selectedDate.toISOString(),
      user_id: '' // Include empty user_id for the form
    });
    setIsEditMode(false);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsEditMode(true);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleComplete = (taskId: string, isCompleted: boolean) => {
    toggleTaskCompleteMutation.mutate({ taskId, isCompleted });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      updateTaskMutation.mutate(currentTask);
    } else {
      // We only need to omit the id and user_id when creating a task
      // as the server will assign these values
      const { id, user_id, ...newTask } = currentTask;
      createTaskMutation.mutate(newTask as Omit<Task, 'id' | 'user_id'>);
    }
  };

  const handleTaskChange = (field: string, value: any) => {
    setCurrentTask(prev => ({ ...prev, [field]: value }));
  };

  // Calendar days generation
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter tasks for selected date
  const tasksForSelectedDate = tasks.filter(task => 
    isSameDay(parseISO(task.due_date), selectedDate)
  );

  // Check if a date has tasks
  const hasTasksOnDate = (date: Date) => {
    return tasks.some(task => isSameDay(parseISO(task.due_date), date));
  };

  return (
    <div className="space-y-4 bg-white rounded-lg p-6 shadow-sm" dir="rtl">
      <div>
        <h2 className="text-2xl font-bold mb-2">לוח שנה ומשימות</h2>
        <h3 className="text-lg text-muted-foreground mb-4">נהל את המשימות והאירועים שלך</h3>
      </div>

      {/* Calendar Component */}
      <div className="space-y-6">
        <CalendarHeader
          currentMonth={currentMonth}
          onPrevMonth={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
          onNextMonth={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
        />

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day names */}
          {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].map(day => (
            <div key={day} className="h-10 flex items-center justify-center font-medium">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {monthDays.map(day => {
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const hasTasks = hasTasksOnDate(day);
            
            return (
              <div
                key={day.toString()}
                className={`
                  h-20 p-1 border rounded-md cursor-pointer transition-colors
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                  ${isToday ? 'bg-blue-50 border-blue-200' : ''}
                  ${isSelected ? 'bg-blue-100 border-blue-400' : ''}
                `}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex justify-between items-start h-full">
                  <span className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {hasTasks && (
                    <span className="h-2 w-2 rounded-full bg-red-500 mt-1"></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tasks Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button 
              onClick={handleAddTask}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              הוסף משימה
            </Button>
            <h3 className="text-xl font-semibold">
              משימות ליום {format(selectedDate, 'dd/MM/yyyy')}
            </h3>
          </div>

          {isLoading ? (
            <div className="text-center py-10">טוען משימות...</div>
          ) : tasksForSelectedDate.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              אין משימות ליום זה. לחץ על "הוסף משימה" כדי ליצור משימה חדשה.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasksForSelectedDate.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'ערוך משימה' : 'הוסף משימה חדשה'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={currentTask}
            onSubmit={handleTaskSubmit}
            onChange={handleTaskChange}
            submitText={isEditMode ? 'שמור שינויים' : 'הוסף משימה'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
