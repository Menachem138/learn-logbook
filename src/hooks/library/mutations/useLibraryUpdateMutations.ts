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
    mutationFn: async ({ id, title, content, type, files, file_details }: {
      id: string;
      title: string;
      content: string;
      type: LibraryItemType;
      files?: File[];
      file_details?: { paths?: string[] };
    }) => {
      console.log("Updating item:", { id, title, content, type, files, file_details });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentItem } = await supabase
        .from('library_items')
        .select('cloudinary_data, file_details')
        .eq('id', id)
        .single();

      let cloudinaryResponse: CloudinaryResponse | null = currentItem?.cloudinary_data ? 
        currentItem.cloudinary_data as unknown as CloudinaryResponse : 
        null;

      // Handle file uploads if present
      if (files?.length) {
        if (cloudinaryResponse?.publicId) {
          await deleteFromCloudinary(cloudinaryResponse.publicId);
        }
        cloudinaryResponse = await uploadToCloudinary(files[0]);
      }

      // Prepare update data
      const updateData: any = {
        title,
        content,
        type,
      };

      // Only include cloudinary_data if we have a response
      if (cloudinaryResponse) {
        updateData.cloudinary_data = cloudinaryResponseToJson(cloudinaryResponse);
      }

      // Include file_details if provided
      if (file_details) {
        updateData.file_details = file_details;
      }

      console.log("Sending update to Supabase:", updateData);

      const { error } = await supabase
        .from('library_items')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      console.log("Update successful");
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