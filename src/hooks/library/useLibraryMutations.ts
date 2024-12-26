import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { uploadToCloudinary } from '@/utils/cloudinaryStorage';
import { LibraryItem, LibraryItemType } from '@/types/library';
import { toast } from 'sonner';

export const useLibraryMutations = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  const uploadAlbum = async (files: FileList, title: string, content: string) => {
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    console.log('Starting album upload with', files.length, 'files');
    
    const uploadedUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        console.log('Uploading file:', file.name);
        const result = await uploadToCloudinary(file);
        if (result) {
          console.log('File uploaded successfully:', result);
          uploadedUrls.push({
            url: result.url,
            publicId: result.publicId
          });
        }
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedUrls.length === 0) {
      throw new Error('No files were successfully uploaded');
    }

    console.log('All files uploaded, saving to database');

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

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Album saved successfully:', data);
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

      console.log('Adding item:', data.type);

      if (data.type === 'image_album' && data.files) {
        return uploadAlbum(data.files, data.title, data.content);
      }
      
      let cloudinaryData = null;
      if (data.files && data.files.length > 0) {
        try {
          console.log('Uploading single file');
          const result = await uploadToCloudinary(data.files[0]);
          if (result) {
            cloudinaryData = {
              publicId: result.publicId,
              url: result.url
            };
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload file');
          throw error;
        }
      }

      console.log('Saving to database');

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

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Item saved successfully:', newItem);
      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Item added successfully');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error('Failed to add item');
    }
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
      toast.success('Item deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete item');
    }
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
    onError: (error) => {
      console.error('Star toggle error:', error);
      toast.error('Failed to update item');
    }
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
      toast.success('Item updated successfully');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update item');
    }
  });

  return {
    addItem,
    deleteItem,
    toggleStar,
    updateItem,
  };
};