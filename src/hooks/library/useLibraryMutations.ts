import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadToCloudinary } from '@/utils/cloudinaryStorage';
import { LibraryItem, LibraryItemType } from '@/types/library';

export const useLibraryMutations = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const uploadAlbum = async (files: FileList, title: string, content: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
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
        content,
        user_id: session.user.id,
        cloudinary_urls: uploadedUrls
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const addItem = useMutation({
    mutationFn: async (data: { 
      type: LibraryItemType; 
      content: string; 
      title: string;
      files?: FileList;
    }) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      if (data.type === 'image_album' && data.files) {
        return uploadAlbum(data.files, data.title, data.content);
      }
      
      let cloudinaryData = null;
      if (data.files && data.files.length > 0) {
        const result = await uploadToCloudinary(data.files[0]);
        if (result) {
          cloudinaryData = {
            publicId: result.publicId,
            url: result.url
          };
        }
      }

      const { data: newItem, error } = await supabase
        .from('library_items')
        .insert({
          type: data.type,
          content: data.content,
          title: data.title,
          user_id: session.user.id,
          cloudinary_data: cloudinaryData,
        })
        .select()
        .single();

      if (error) throw error;
      return newItem;
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
