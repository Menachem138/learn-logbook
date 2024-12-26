import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LibraryItem, LibraryItemType, CloudinaryData, FileDetails } from '@/types/library';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type LibraryItemRow = Database['public']['Tables']['library_items']['Row'];

interface CloudinaryDataJson {
  publicId?: string;
  url?: string;
  resourceType?: string;
  format?: string;
  size?: number;
}

interface FileDetailsJson {
  path?: string | string[];
  name?: string;
  size?: number;
  type?: string;
}

export const useLibraryQuery = (filter: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useQuery({
    queryKey: ['library-items', filter],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return [];
      }

      let query = supabase
        .from('library_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter) {
        query = query.or(`title.ilike.%${filter}%,content.ilike.%${filter}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching library items:', error);
        toast({
          title: "שגיאה בטעינת פריטים",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      // Transform the data to match LibraryItem type
      const transformedData = (data || []).map((item: LibraryItemRow): LibraryItem => {
        // Safely transform cloudinary_data
        let cloudinaryData: CloudinaryData | CloudinaryData[] | null = null;
        if (item.cloudinary_data) {
          try {
            const cloudinaryJson = item.cloudinary_data as CloudinaryDataJson | CloudinaryDataJson[];
            cloudinaryData = Array.isArray(cloudinaryJson) 
              ? cloudinaryJson.map(d => ({
                  publicId: d.publicId,
                  url: d.url,
                  resourceType: d.resourceType,
                  format: d.format,
                  size: d.size,
                }))
              : {
                  publicId: (cloudinaryJson as CloudinaryDataJson).publicId,
                  url: (cloudinaryJson as CloudinaryDataJson).url,
                  resourceType: (cloudinaryJson as CloudinaryDataJson).resourceType,
                  format: (cloudinaryJson as CloudinaryDataJson).format,
                  size: (cloudinaryJson as CloudinaryDataJson).size,
                };
          } catch (e) {
            console.error('Error parsing cloudinary_data:', e);
          }
        }

        // Safely transform file_details
        let fileDetails: FileDetails | undefined;
        if (item.file_details) {
          try {
            const fileJson = item.file_details as FileDetailsJson;
            fileDetails = {
              path: fileJson.path,
              name: fileJson.name,
              size: fileJson.size,
              type: fileJson.type,
            };
          } catch (e) {
            console.error('Error parsing file_details:', e);
          }
        }

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          type: item.type as LibraryItemType,
          file_details: fileDetails,
          cloudinary_data: cloudinaryData,
          is_starred: item.is_starred,
          created_at: item.created_at,
          user_id: item.user_id
        };
      });

      return transformedData;
    },
  });
};