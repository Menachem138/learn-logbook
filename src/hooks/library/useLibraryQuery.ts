import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LibraryItem } from '@/types/library';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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

      return data.map((item: any): LibraryItem => ({
        ...item,
        file_details: item.file_details ? 
          (Array.isArray(item.file_details) ? 
            item.file_details.map((detail: any) => ({
              path: detail.path,
              title: detail.title,
              type: detail.type,
              name: detail.name,
              size: detail.size,
            })) : 
            {
              path: item.file_details.path,
              type: item.file_details.type,
              name: item.file_details.name,
              size: item.file_details.size,
            }
          ) : undefined
      }));
    },
  });
};