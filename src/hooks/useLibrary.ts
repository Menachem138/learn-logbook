import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLibraryMutations } from './library/useLibraryMutations';
import { useAuth } from '@/hooks/useAuth';
import { LibraryItem } from '@/types/library';

export const useLibrary = () => {
  const { session } = useAuth();
  const [filter, setFilter] = React.useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['library-items', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching library items:', error);
        throw error;
      }

      return data as LibraryItem[];
    },
    enabled: !!session?.user?.id,
  });

  const mutations = useLibraryMutations();

  const filteredItems = React.useMemo(() => {
    return items.filter(item =>
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      item.content.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  return {
    items: filteredItems,
    isLoading,
    filter,
    setFilter,
    ...mutations,
  };
};
