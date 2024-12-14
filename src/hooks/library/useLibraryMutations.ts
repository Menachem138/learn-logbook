import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage } from '@/utils/fileStorage';

export const useLibraryMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async ({ title, content, type, file, url }: {
      title: string;
      content: string;
      type: string;
      file?: File;
      url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let fileDetails = null;

      if (file) {
        const { publicUrl, filePath, fileName, fileSize, mimeType } = await uploadFileToStorage(file, user.id);
        fileDetails = {
          path: publicUrl,
          name: fileName,
          size: fileSize,
          type: mimeType,
        };
      }

      const { error } = await supabase
        .from('library_items')
        .insert({
          title,
          content,
          type,
          url: type === 'youtube' ? url : undefined,
          file_details: fileDetails,
          user_id: user.id,
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

  const updateItem = useMutation({
    mutationFn: async ({ id, title, content, type, file, url }: {
      id: string;
      title: string;
      content: string;
      type: string;
      file?: File;
      url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let fileDetails = null;

      if (file) {
        const { publicUrl, filePath, fileName, fileSize, mimeType } = await uploadFileToStorage(file, user.id);
        fileDetails = {
          path: publicUrl,
          name: fileName,
          size: fileSize,
          type: mimeType,
        };
      }

      const { error } = await supabase
        .from('library_items')
        .update({
          title,
          content,
          type,
          url: type === 'youtube' ? url : undefined,
          ...(fileDetails && { file_details: fileDetails }),
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

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
      toast({
        title: "הפריט נמחק בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: "שגיאה במחיקת הפריט",
        description: error.message,
        variant: "destructive",
      });
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
      queryClient.invalidateQueries({ queryKey: ['library-items'] });
    },
    onError: (error) => {
      console.error('Error toggling star:', error);
      toast({
        title: "שגיאה בעדכון הפריט",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    addItem,
    updateItem,
    deleteItem,
    toggleStar,
  };
};
