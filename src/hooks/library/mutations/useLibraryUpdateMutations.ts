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
      file?: File | File[];
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

      let cloudinaryResponses: CloudinaryResponse[] = currentItem?.cloudinary_data
        ? Array.isArray(currentItem.cloudinary_data)
          ? currentItem.cloudinary_data as unknown as CloudinaryResponse[]
          : [currentItem.cloudinary_data as unknown as CloudinaryResponse]
        : [];

      if (file) {
        // Delete existing files
        for (const response of cloudinaryResponses) {
          if (response?.publicId) {
            await deleteFromCloudinary(response.publicId);
          }
        }

        // Upload new files
        const files = Array.isArray(file) ? file : [file];
        cloudinaryResponses = [];
        
        for (const f of files) {
          const response = await uploadToCloudinary(f);
          cloudinaryResponses.push(response);
        }
      }

      const { error } = await supabase
        .from('library_items')
        .update({
          title,
          content,
          type,
          cloudinary_data: type === 'image_album'
            ? cloudinaryResponses.map(r => cloudinaryResponseToJson(r))
            : cloudinaryResponseToJson(cloudinaryResponses[0]),
          file_details: cloudinaryResponses.length > 0
            ? type === 'image_album'
              ? cloudinaryResponses.map(r => ({
                  path: r.url,
                  type: Array.isArray(file) ? file[cloudinaryResponses.indexOf(r)]?.type : file?.type,
                  name: Array.isArray(file) ? file[cloudinaryResponses.indexOf(r)]?.name : file?.name,
                  size: Array.isArray(file) ? file[cloudinaryResponses.indexOf(r)]?.size : file?.size,
                }))
              : {
                  path: cloudinaryResponses[0].url,
                  type: Array.isArray(file) ? file[0]?.type : file?.type,
                  name: Array.isArray(file) ? file[0]?.name : file?.name,
                  size: Array.isArray(file) ? file[0]?.size : file?.size,
                }
            : null,
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
