import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadToCloudinary } from '@/utils/cloudinaryStorage';
import { LibraryItem, LibraryItemType } from '@/types/library';

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
          publicId: result.publicId
        });
      }
    }

    const { data, error } = await supabase
      .from('library_items')
      .insert({
        type: 'image_album' as LibraryItemType,
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

  const addItem = useMutation({
    mutationFn: async ({ 
      type, 
      content, 
      files,
      title = 'Untitled'
    }: { 
      type: LibraryItemType; 
      content: string; 
      files?: File[];
      title?: string;
    }) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      if (type === 'image_album' && files) {
        return uploadAlbum(files, title, content);
      }
      
      const { data, error } = await supabase
        .from('library_items')
        .insert({
          type,
          content,
          title,
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

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const toggleStar = useMutation({
    mutationFn: async ({ id, is_starred }: { id: string; is_starred: boolean }) => {
      const { error } = await supabase
        .from('library_items')
        .update({ is_starred })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: Partial<LibraryItem> & { id: string }) => {
      const { error } = await supabase
        .from('library_items')
        .update(item)
        .eq('id', item.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });

  return {
    addItem,
    deleteItem,
    toggleStar,
    updateItem,
  };
};