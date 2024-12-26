import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadToCloudinary } from '@/utils/cloudinaryStorage';

export const useLibraryMutations = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const uploadAlbum = async (files: File[], title: string, description: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const uploadedUrls = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file);
      if (result) {
        uploadedUrls.push({
          url: result.url,
          publicId: result.public_id
        });
      }
    }

    const { data, error } = await supabase
      .from('library_items')
      .insert({
        type: 'image_album',
        title,
        content: description,
        user_id: session.user.id,
        cloudinary_urls: uploadedUrls
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const mutation = useMutation({
    mutationFn: async ({ 
      type, 
      content, 
      files,
      title = 'Untitled'
    }: { 
      type: string; 
      content: string; 
      files?: File[];
      title?: string;
    }) => {
      if (type === 'image_album' && files) {
        return uploadAlbum(files, title, content);
      }
      
      const { data, error } = await supabase
        .from('library_items')
        .insert({
          type,
          content,
          user_id: session.user.id,
          cloudinary_data: null,
          file_details: null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  return {
    addItem: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
