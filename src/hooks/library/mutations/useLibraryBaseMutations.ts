import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LibraryItemType } from '@/types/library';
import { cloudinaryResponseToJson, uploadToCloudinary } from '@/utils/cloudinaryUtils';
import { CloudinaryResponse } from '@/types/cloudinary';

export const useLibraryBaseMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async ({ title, content, type, file }: { 
      title: string;
      content: string;
      type: LibraryItemType;
      file?: File | File[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let cloudinaryResponses: CloudinaryResponse[] = [];

      if (file) {
        const files = Array.isArray(file) ? file : [file];
        console.log('Uploading files to Cloudinary:', files);
        
        for (const f of files) {
          const response = await uploadToCloudinary(f);
          cloudinaryResponses.push(response);
        }
        
        console.log('Cloudinary upload responses:', cloudinaryResponses);
      }

      const { error } = await supabase
        .from('library_items')
        .insert({
          title,
          content,
          type,
          cloudinary_data: type === 'image_album' 
            ? cloudinaryResponses.map(r => cloudinaryResponseToJson(r))
            : cloudinaryResponseToJson(cloudinaryResponses[0]),
          user_id: user.id,
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
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      toast({
        title: "הפריט נוסף בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast({
        title: "שגיאה בהוספת הפריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { addItem };
};
