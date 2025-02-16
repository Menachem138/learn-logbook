import { useState } from 'react';
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { EventForm } from './EventForm';
import { TaskForm } from './TaskForm';
import { EventList } from './EventList';
import { TaskCard } from './TaskCard';
import { CalendarHeader } from './CalendarHeader';

type Event = {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  user_id: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: 'urgent' | 'medium' | 'low';
  is_completed: boolean;
  user_id: string;
};

type ViewMode = 'day' | 'week' | 'month';

type NewEvent = Omit<Event, 'id' | 'user_id' | 'is_all_day' | 'created_at' | 'updated_at'>;
type NewTask = Omit<Task, 'id' | 'user_id' | 'is_completed'>;

export function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
  });
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
  });

  // Event mutations
  const addEventMutation = useMutation({
    mutationFn: async (eventData: NewEvent) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...eventData,
          user_id: userData.user.id,
          is_all_day: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע נוסף בהצלחה",
        description: "האירוע נוסף ללוח השנה שלך",
      });
      setIsAddEventOpen(false);
      setNewEvent({ title: '', description: '', start_time: '', end_time: '' });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להוסיף את האירוע",
        variant: "destructive",
      });
      console.error('Error adding event:', error);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Event) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
        })
        .eq('id', eventData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע עודכן בהצלחה",
        description: "האירוע עודכן בלוח השנה שלך",
      });
      setIsEditEventOpen(false);
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את האירוע",
        variant: "destructive",
      });
      console.error('Error updating event:', error);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "אירוע נמחק בהצלחה",
        description: "האירוע הוסר מלוח השנה שלך",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את האירוע",
        variant: "destructive",
      });
      console.error('Error deleting event:', error);
    },
  });

  // Task mutations
  const addTaskMutation = useMutation({
    mutationFn: async (taskData: NewTask) => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: userData.user.id,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נוספה בהצלחה",
        description: "המשימה נוספה ללוח המשימות שלך",
      });
      setIsAddTaskOpen(false);
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium' });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו להוסיף את המשימה",
        variant: "destructive",
      });
      console.error('Error adding task:', error);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: Task) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.due_date,
          priority: taskData.priority,
          is_completed: taskData.is_completed,
        })
        .eq('id', taskData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה עודכנה בהצלחה",
        description: "המשימה עודכנה בלוח המשימות שלך",
      });
      setIsEditTaskOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו לעדכן את המשימה",
        variant: "destructive",
      });
      console.error('Error updating task:', error);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "משימה נמחקה בהצלחה",
        description: "המשימה הוסרה מלוח המשימות שלך",
      });
    },
    onError: (error) => {
      toast({
        title: "שגיאה",
        description: "לא הצלחנו למחוק את המשימה",
        variant: "destructive",
      });
      console.error('Error deleting task:', error);
    },
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    addEventMutation.mutate(newEvent);
  };

  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    updateEventMutation.mutate(selectedEvent);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.due_date) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return;
    }

    addTaskMutation.mutate(newTask);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    updateTaskMutation.mutate(selectedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משימה זו?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleToggleComplete = (taskId: string, isCompleted: boolean) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      updateTaskMutation.mutate({ ...task, is_completed: isCompleted });
    }
  };

  const selectedDateEvents = events?.filter(event => {
    if (!date) return false;
    
    const eventDate = new Date(event.start_time);
    const selectedDate = new Date(date);
    
    return (
      eventDate.getFullYear() === selectedDate.getFullYear() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const selectedDateTasks = tasks?.filter(task => {
    if (!date) return false;
    
    const taskDate = new Date(task.due_date);
    const selectedDate = new Date(date);
    
    return (
      taskDate.getFullYear() === selectedDate.getFullYear() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getDate() === selectedDate.getDate()
    );
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>לוח שנה ומשימות</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (date) {
                  setNewTask(prev => ({
                    ...prev,
                    due_date: date.toISOString()
                  }));
                }
                setIsAddTaskOpen(true);
              }}
              variant="outline"
            >
              <Plus className="h-4 w-4 ml-2" />
              משימה חדשה
            </Button>
            <Button
              onClick={() => {
                if (date) {
                  setNewEvent(prev => ({
                    ...prev,
                    start_time: date.toISOString(),
                    end_time: date.toISOString()
                  }));
                }
                setIsAddEventOpen(true);
              }}
            >
              <Plus className="h-4 w-4 ml-2" />
              אירוע חדש
            </Button>
          </div>
        </div>
        <CalendarHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddEvent={() => setIsAddEventOpen(true)}
        />
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <CalendarUI
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={he}
          />
        </div>
        <div className="flex-1 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {date ? format(date, 'EEEE, d בMMMM', { locale: he }) : 'בחר תאריך'}
            </h3>
            {isLoadingEvents ? (
              <p>טוען אירועים...</p>
            ) : (
              <EventList
                events={selectedDateEvents || []}
                onEdit={(event) => {
                  setSelectedEvent(event);
                  setIsEditEventOpen(true);
                }}
                onDelete={handleDeleteEvent}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">משימות</h3>
            {isLoadingTasks ? (
              <p>טוען משימות...</p>
            ) : selectedDateTasks && selectedDateTasks.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {selectedDateTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(task) => {
                      setSelectedTask(task);
                      setIsEditTaskOpen(true);
                    }}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">אין משימות ביום זה</p>
            )}
          </div>
        </div>
      </CardContent>

      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף אירוע חדש</DialogTitle>
          </DialogHeader>
          <EventForm
            event={newEvent}
            onSubmit={handleAddEvent}
            onChange={(field, value) => setNewEvent({ ...newEvent, [field]: value })}
            submitText="הוסף אירוע"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditEventOpen} onOpenChange={setIsEditEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך אירוע</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              event={selectedEvent}
              onSubmit={handleEditEvent}
              onChange={(field, value) => setSelectedEvent({ ...selectedEvent, [field]: value })}
              submitText="שמור שינויים"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף משימה חדשה</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={newTask}
            onSubmit={handleAddTask}
            onChange={(field, value) => setNewTask({ ...newTask, [field]: value })}
            submitText="הוסף משימה"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ערוך משימה</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              task={selectedTask}
              onSubmit={handleEditTask}
              onChange={(field, value) => setSelectedTask({ ...selectedTask, [field]: value })}
              submitText="שמור שינויים"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
