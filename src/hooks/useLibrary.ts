import { useState } from 'react';
import { useLibraryQuery } from './library/useLibraryQuery';
import { useLibraryMutations } from './library/useLibraryMutations';

export const useLibrary = () => {
  const [filter, setFilter] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const { data: items = [], isLoading } = useLibraryQuery(filter);
  const mutations = useLibraryMutations();

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  return {
    items,
    isLoading,
    filter,
    setFilter,
    selectedFiles,
    handleFileSelect,
    ...mutations,
  };
};