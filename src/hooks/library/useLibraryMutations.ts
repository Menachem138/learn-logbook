import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { deleteFromCloudinary } from '../../utils/cloudinaryUtils';
import { CloudinaryResponse } from '../../types/cloudinary';
import { isCloudinaryResponse } from '../../utils/cloudinaryTypeGuards';
import { useLibraryBaseMutations } from './mutations/useLibraryBaseMutations';
import { useLibraryUpdateMutations } from './mutations/useLibraryUpdateMutations';
import { LibraryItemInput, LibraryItemUpdate } from '../../types/library';

export const useLibraryMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addItem } = useLibraryBaseMutations();
  const { updateItem } = useLibraryUpdateMutations();

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting item with ID:", id);
      
      const { data: item } = await supabase
        .from('library_items')
        .select('cloudinary_data, file_details')
        .eq('id', id)
        .single();

      console.log("Found item to delete:", item);

      // Delete from Cloudinary if applicable
      const cloudinaryData = item?.cloudinary_data;
      if (cloudinaryData && isCloudinaryResponse(cloudinaryData)) {
        await deleteFromCloudinary(cloudinaryData.publicId);
      }

      // Delete from Supabase
      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting from Supabase:", error);
        throw error;
      }

      console.log("Item deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      toast({
        title: "הפריט נמחק בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: "שגיאה במחיקת הפריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleStar = useMutation({
    mutationFn: async ({ id, is_starred }: { id: string; is_starred: boolean }) => {
      console.log("Toggling star for item:", id, "to:", is_starred);
      
      const { error } = await supabase
        .from('library_items')
        .update({ is_starred })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    },
    onError: (error) => {
      console.error('Error toggling star:', error);
      toast({
        title: "שגיאה בעדכון הפריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addItem,
    updateItem,
    deleteItem,
    toggleStar,
  };
};
