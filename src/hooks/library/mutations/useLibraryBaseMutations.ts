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
    mutationFn: async ({ title, content, type, files }: { 
      title: string;
      content: string;
      type: LibraryItemType;
      files?: FileList;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let cloudinaryResponses: CloudinaryResponse[] = [];

      if (files && files.length > 0) {
        console.log('Uploading files to Cloudinary:', files);
        
        // Upload all files to Cloudinary
        const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
        cloudinaryResponses = await Promise.all(uploadPromises);
        console.log('Cloudinary upload responses:', cloudinaryResponses);
      }

      const fileDetails = cloudinaryResponses.length > 0 ? {
        path: cloudinaryResponses.length === 1 ? 
          cloudinaryResponses[0].url : 
          cloudinaryResponses.map(response => response.url),
        type: files?.[0].type,
        name: files?.[0].name,
        size: files?.[0].size,
      } : null;

      const { error } = await supabase
        .from('library_items')
        .insert({
          title,
          content,
          type,
          cloudinary_data: cloudinaryResponses.length === 1 ? 
            cloudinaryResponseToJson(cloudinaryResponses[0]) : 
            cloudinaryResponses.map(cloudinaryResponseToJson),
          user_id: user.id,
          file_details: fileDetails,
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