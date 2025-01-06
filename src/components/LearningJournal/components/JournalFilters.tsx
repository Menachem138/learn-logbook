import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JournalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export const JournalFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
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
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="סוג רשומה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">הכל</SelectItem>
          <SelectItem value="learning">למידה</SelectItem>
          <SelectItem value="trading">מסחר</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};