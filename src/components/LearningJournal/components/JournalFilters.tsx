import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JournalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTag: string;
  onTagChange: (value: string) => void;
}

export const JournalFilters = ({
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagChange,
}: JournalFiltersProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <Input
        type="text"
        placeholder="חיפוש ביומן..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Select value={selectedTag} onValueChange={onTagChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="כל התגיות" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">כל התגיות</SelectItem>
          <SelectItem value="learning">למידה</SelectItem>
          <SelectItem value="trading">מסחר</SelectItem>
          <SelectItem value="graph">גרף</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};