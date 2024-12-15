import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database';

type StudyGoal = Database['public']['Tables']['study_goals']['Row'];

export const useGoals = () => {
  const { data: goals = [], isLoading, error } = useQuery<StudyGoal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const completedGoals = goals.filter(goal => goal.completed);
  const totalGoals = goals.length;
  const completionPercentage = totalGoals > 0 ? (completedGoals.length / totalGoals) * 100 : 0;

  return {
    goals,
    completedGoals,
    totalGoals,
    completionPercentage,
    isLoading,
    error,
  };
};
