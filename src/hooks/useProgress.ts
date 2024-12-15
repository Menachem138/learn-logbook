import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface ProgressState {
  lessonProgress: number;
  goalProgress: number;
  totalProgress: number;
  setLessonProgress: (progress: number) => void;
  setGoalProgress: (progress: number) => void;
  fetchProgress: () => Promise<void>;
}

export const useProgress = create<ProgressState>()((set) => ({
  lessonProgress: 0,
  goalProgress: 0,
  totalProgress: 0,
  setLessonProgress: (progress) =>
    set((state) => ({
      lessonProgress: progress,
      totalProgress: Math.round((progress + state.goalProgress) / 2)
    })),
  setGoalProgress: (progress) =>
    set((state) => ({
      goalProgress: progress,
      totalProgress: Math.round((state.lessonProgress + progress) / 2)
    })),
  fetchProgress: async () => {
    try {
      // Fetch completed lessons
      const { data: completedLessons } = await supabase
        .from('completed_lessons')
        .select('*');

      // Fetch total lessons
      const { data: totalLessons } = await supabase
        .from('lessons')
        .select('*');

      // Fetch goals
      const { data: goals } = await supabase
        .from('study_goals')
        .select('*');

      const completedGoals = goals?.filter(goal => goal.completed) || [];

      const lessonProgress = totalLessons?.length
        ? (completedLessons?.length || 0) / totalLessons.length * 100
        : 0;

      const goalProgress = goals?.length
        ? (completedGoals.length / goals.length) * 100
        : 0;

      set({
        lessonProgress,
        goalProgress,
        totalProgress: Math.round((lessonProgress + goalProgress) / 2)
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }
}));
