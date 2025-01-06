import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';

interface JournalFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  onDateRangeChange: (range: { from: Date | undefined; to: Date | undefined }) => void;
}

export function JournalFilters({ 
  searchQuery, 
  onSearchChange,
  dateRange,
  onDateRangeChange
}: JournalFiltersProps) {
  return (
    <div className="space-y-4 mb-6 bg-card p-4 rounded-lg">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="חפש ביומן..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div>
        <Label>טווח תאריכים</Label>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={onDateRangeChange}
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant="outline" className="cursor-pointer">
          הכל
        </Badge>
        <Badge variant="outline" className="cursor-pointer">
          חשוב
        </Badge>
      </div>
    </div>
  );
}