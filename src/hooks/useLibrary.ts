import { useState } from 'react';
import { useLibraryQuery } from './library/useLibraryQuery';
import { useLibraryMutations } from './library/useLibraryMutations';

export const useLibrary = () => {
  const [filter, setFilter] = useState('');
  
  const { data: items = [], isLoading, error } = useLibraryQuery(filter);
  const mutations = useLibraryMutations();

  return {
    items,
    isLoading,
    error,
    filter,
    setFilter,
    ...mutations,
  };
};