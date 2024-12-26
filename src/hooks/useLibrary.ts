import { useState } from 'react';
import { useLibraryQuery } from './library/useLibraryQuery';
import { useLibraryMutations } from './library/useLibraryMutations';

export const useLibrary = () => {
  const [filter, setFilter] = useState('');
  
  const { data: items = [], isLoading } = useLibraryQuery(filter);
  const mutations = useLibraryMutations();

  return {
    items,
    isLoading,
    filter,
    setFilter,
    ...mutations,
  };
};