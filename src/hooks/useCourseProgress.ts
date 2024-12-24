import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getTotalLessons } from '@/components/CourseContent/sections';

export function useCourseProgress() {
  const [completedLessons, setCompletedLessons] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.id) {
      loadProgress();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const loadProgress = async () => {
    try {
      console.log("Loading progress for user:", session?.user?.id);
      const { data, error: supabaseError } = await supabase
        .from('course_progress')
        .select('lesson_id')
        .eq('user_id', session?.user?.id)
        .eq('completed', true);

      if (supabaseError) {
        throw supabaseError;
      }

      console.log("Loaded progress data:", data);
      setCompletedLessons(new Set(data.map(item => item.lesson_id)));
      setError(null);
    } catch (err) {
      console.error('Error loading progress:', err);
      setError(err as Error);
      toast({
        title: "שגיאה בטעינת ההתקדמות",
        description: "לא הצלחנו לטעון את ההתקדמות שלך. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = async (lessonId: string) => {
    if (!session?.user?.id || !completedLessons) return;
    
    const isCompleted = completedLessons.has(lessonId);
    
    try {
      console.log("Toggling lesson:", lessonId, "completed:", !isCompleted);
      if (isCompleted) {
        const { error: deleteError } = await supabase
          .from('course_progress')
          .delete()
          .eq('user_id', session.user.id)
          .eq('lesson_id', lessonId);

        if (deleteError) throw deleteError;

        setCompletedLessons(prev => {
          if (!prev) return new Set();
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      } else {
        const { error: insertError } = await supabase
          .from('course_progress')
          .insert([
            {
              user_id: session.user.id,
              lesson_id: lessonId,
              completed: true,
            },
          ]);

        if (insertError) throw insertError;

        setCompletedLessons(prev => {
          if (!prev) return new Set([lessonId]);
          return new Set([...prev, lessonId]);
        });
      }

      const totalLessons = getTotalLessons();
      const completedCount = (completedLessons?.size || 0) + (isCompleted ? -1 : 1);
      
      toast({
        title: "התקדמות עודכנה",
        description: `השלמת ${completedCount} מתוך ${totalLessons} שיעורים`,
      });
    } catch (err) {
      console.error('Error updating progress:', err);
      toast({
        title: "שגיאה בשמירת ההתקדמות",
        description: "לא הצלחנו לשמור את ההתקדמות שלך. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    completedLessons,
    loading,
    error,
    toggleLesson,
  };
}