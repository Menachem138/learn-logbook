import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export function SearchFilters({ searchTerm, onSearchChange, onClearSearch }: SearchFiltersProps) {
  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חפש ביומן..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 pr-4"
          dir="rtl"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-5 w-5 p-0"
            onClick={onClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}