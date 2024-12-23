import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LibraryItemUpdate } from '@/types/library';

export const useLibraryUpdateMutations = () => {
  const queryClient = useQueryClient();

  const updateItem = useMutation({
    mutationFn: async (data: LibraryItemUpdate) => {
      console.log('Updating item with data:', data);
      
      const { error } = await supabase
        .from('library_items')
        .update({
          title: data.title,
          content: data.content,
          type: data.type,
          file_details: data.file_details,
        })
        .eq('id', data.id);

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    },
  });

  return {
    updateItem,
  };
};