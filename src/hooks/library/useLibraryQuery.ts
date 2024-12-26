import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LibraryItem } from '@/types/library';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type LibraryItemRow = Database['public']['Tables']['library_items']['Row'];

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
      const transformedData: LibraryItem[] = (data || []).map((item: LibraryItemRow) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        type: item.type,
        file_details: item.file_details as LibraryItem['file_details'],
        cloudinary_data: item.cloudinary_data as LibraryItem['cloudinary_data'],
        is_starred: item.is_starred,
        created_at: item.created_at,
        user_id: item.user_id
      }));

      return transformedData;
    },
  });
};