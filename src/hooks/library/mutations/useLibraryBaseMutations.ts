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
      files?: File[];
    }) => {
      console.log('Starting mutation with:', { title, content, type, filesCount: files?.length });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let cloudinaryResponses: CloudinaryResponse[] = [];

      if (files && files.length > 0) {
        console.log('Uploading files to Cloudinary:', files.map(f => f.name));
        
        // Upload all files to Cloudinary
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        try {
          cloudinaryResponses = await Promise.all(uploadPromises);
          console.log('Cloudinary upload responses:', cloudinaryResponses);
        } catch (error) {
          console.error('Error uploading to Cloudinary:', error);
          throw new Error('Failed to upload images to Cloudinary');
        }
      }

      // For image_gallery, we'll store all URLs in the file_details
      const fileDetails = type === 'image_gallery' && cloudinaryResponses.length > 0
        ? {
            paths: cloudinaryResponses.map(response => response.url),
            type: 'image_gallery',
            names: files?.map(f => f.name)
          }
        : cloudinaryResponses[0]
          ? {
              path: cloudinaryResponses[0].url,
              type: files?.[0]?.type,
              name: files?.[0]?.name,
              size: files?.[0]?.size,
            }
          : null;

      console.log('Saving to Supabase with file_details:', fileDetails);

      const { error } = await supabase
        .from('library_items')
        .insert({
          title,
          content,
          type,
          cloudinary_data: type === 'image_gallery' 
            ? cloudinaryResponses.map(cloudinaryResponseToJson)
            : cloudinaryResponseToJson(cloudinaryResponses[0]),
          user_id: user.id,
          file_details: fileDetails,
        });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
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