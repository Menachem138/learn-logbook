import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LibraryItemType } from '@/types/library';
import { cloudinaryResponseToJson, uploadToCloudinary, deleteFromCloudinary } from '@/utils/cloudinaryUtils';
import { CloudinaryResponse, CloudinaryData } from '@/types/cloudinary';

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
      console.log("Starting update with data:", { id, title, content, type, files, file_details });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: currentItem } = await supabase
        .from('library_items')
        .select('cloudinary_data, file_details')
        .eq('id', id)
        .single();

      let cloudinaryData = currentItem?.cloudinary_data as CloudinaryData | null;
      let updatedFileDetails = file_details || {};

      // Handle file uploads for image gallery
      if (type === 'image_gallery' && files && files.length > 0) {
        console.log("Processing new files for image gallery:", files.length);
        
        const uploadPromises = files.map(file => uploadToCloudinary(file));
        const uploadResults = await Promise.all(uploadPromises);
        
        // Get URLs from new uploads
        const newUrls = uploadResults.map(result => result.url);
        console.log("New uploaded URLs:", newUrls);

        // Combine existing paths with new URLs
        const existingPaths = file_details?.paths || [];
        updatedFileDetails = {
          paths: [...existingPaths, ...newUrls]
        };
        
        console.log("Updated file details:", updatedFileDetails);
      }
      // Handle single file upload
      else if ((type === 'image' || type === 'video' || type === 'pdf') && files?.[0]) {
        if (cloudinaryData?.publicId) {
          await deleteFromCloudinary(cloudinaryData.publicId);
        }
        const uploadResult = await uploadToCloudinary(files[0]);
        cloudinaryData = cloudinaryResponseToJson(uploadResult);
      }

      // Prepare update data
      const updateData: any = {
        title,
        content,
        type,
        file_details: updatedFileDetails
      };

      if (cloudinaryData) {
        updateData.cloudinary_data = cloudinaryData;
      }

      console.log("Sending final update to Supabase:", updateData);

      const { error: updateError } = await supabase
        .from('library_items')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      console.log("Update completed successfully");
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