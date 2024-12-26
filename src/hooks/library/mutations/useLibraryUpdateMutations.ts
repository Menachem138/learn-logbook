import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LibraryItemType } from '@/types/library';
import { cloudinaryResponseToJson, uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinaryUtils';
import { CloudinaryResponse } from '@/types/cloudinary';

export const useLibraryUpdateMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateItem = useMutation({
    mutationFn: async ({ id, title, content, type, file }: {
      id: string;
      title: string;
      content: string;
      type: LibraryItemType;
      file?: File;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentItem } = await supabase
        .from('library_items')
        .select('cloudinary_data')
        .eq('id', id)
        .single();

      let cloudinaryResponse: CloudinaryResponse | null = currentItem?.cloudinary_data ? 
        currentItem.cloudinary_data as unknown as CloudinaryResponse : 
        null;

      if (file) {
        if (cloudinaryResponse?.publicId) {
          await deleteFromCloudinary(cloudinaryResponse.publicId);
        }
        cloudinaryResponse = await uploadToCloudinary(file);
      }

      const { error } = await supabase
        .from('library_items')
        .update({
          title,
          content,
          type,
          cloudinary_data: cloudinaryResponseToJson(cloudinaryResponse),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      toast({
        title: "הפריט עודכן בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({
        title: "שגיאה בעדכון הפריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { updateItem };
};