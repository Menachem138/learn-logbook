import React from 'react';
import { SearchFilters } from '../SearchFilters';

interface JournalHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export const JournalHeader: React.FC<JournalHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">יומן למידה</h2>
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />
    </div>
  );
};