import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getTotalLessons } from '@/components/CourseContent/sections';

export function useCourseProgress() {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      loadProgress();
    }
  }, [session?.user?.id]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', session?.user?.id)
        .eq('completed', true);

      if (error) throw error;

      setCompletedLessons(new Set(data.map(item => item.lesson_id)));
    } catch (error) {
      console.error('Error loading progress:', error);
      toast({
        title: "שגיאה בטעינת ההתקדמות",
        description: "לא הצלחנו לטעון את ההתקדמות שלך",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = async (lessonId: string) => {
    if (!session?.user?.id) return;
    
    const isCompleted = completedLessons.has(lessonId);
    
    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('course_progress')
          .delete()
          .eq('user_id', session.user.id)
          .eq('lesson_id', lessonId);

        if (error) throw error;

        setCompletedLessons(prev => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      } else {
        const { error } = await supabase
          .from('course_progress')
          .insert([
            {
              user_id: session.user.id,
              lesson_id: lessonId,
              completed: true,
            },
          ]);

        if (error) throw error;

        setCompletedLessons(prev => new Set([...prev, lessonId]));
      }

      const totalLessons = getTotalLessons();
      const completedCount = completedLessons.size + (isCompleted ? -1 : 1);
      
      toast({
        title: "התקדמות עודכנה",
        description: `השלמת ${completedCount} מתוך ${totalLessons} שיעורים`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "שגיאה בשמירת ההתקדמות",
        description: "לא הצלחנו לשמור את ההתקדמות שלך",
        variant: "destructive",
      });
    }
  };

  return {
    completedLessons,
    loading,
    toggleLesson,
  };
}