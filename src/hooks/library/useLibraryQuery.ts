import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { ContentItem, transformToContentItem } from '@/types/content';

interface CloudinaryDataJson {
  publicId?: string;
  url?: string;
  resourceType?: string;
  format?: string;
  size?: number;
}

interface FileDetailsJson {
  path?: string;
  name?: string;
  size?: number;
  type?: string;
}

export const useLibraryQuery = (filter: string) => {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['library', filter],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      const { data: items, error } = await supabase
        .from('library_items')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching library items:', error);
        return [];
      }

      return items
        .map(item => {
          let cloudinaryData: CloudinaryDataJson | null = null;
          let fileDetails: FileDetailsJson | null = null;

          try {
            if (item.cloudinary_data) {
              cloudinaryData = typeof item.cloudinary_data === 'string' 
                ? JSON.parse(item.cloudinary_data)
                : item.cloudinary_data;
            }

            if (item.file_details) {
              fileDetails = typeof item.file_details === 'string'
                ? JSON.parse(item.file_details)
                : item.file_details;
            }
          } catch (e) {
            console.error('Error parsing JSON data:', e);
          }

          const transformedItem = transformToContentItem({
            ...item,
            cloudinary_data: cloudinaryData,
            file_details: fileDetails,
          });

          return transformedItem;
        })
        .filter((item): item is ContentItem => item !== null);
    },
    enabled: !!session?.user?.id,
  });
};