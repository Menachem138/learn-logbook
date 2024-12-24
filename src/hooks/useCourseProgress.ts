import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      if (supabaseError) throw supabaseError;

      console.log("Loaded progress data:", data);
      setCompletedLessons(new Set(data.map(item => item.lesson_id)));
      setError(null);
    } catch (err) {
      console.error('Error loading progress:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = async (lessonId: string) => {
    if (!session?.user?.id || !completedLessons) return;
    
    const isCompleted = completedLessons.has(lessonId);
    
    try {
      if (isCompleted) {
        // Delete the progress record
        const { error: deleteError } = await supabase
          .from('course_progress')
          .delete()
          .eq('user_id', session.user.id)
          .eq('lesson_id', lessonId);

        if (deleteError) throw deleteError;

        setCompletedLessons(prev => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      } else {
        // Insert new progress record
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
    } catch (err) {
      console.error('Error updating progress:', err);
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