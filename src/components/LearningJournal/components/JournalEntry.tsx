import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, BookOpen, BarChart } from 'lucide-react';

interface JournalEntryProps {
  entry: {
    id: string;
    content: string;
    created_at: string;
    is_important: boolean;
    type?: 'learning' | 'trading';
  };
  onEdit: () => void;
  onDelete: () => void;
}

export const JournalEntry = ({ entry, onEdit, onDelete }: JournalEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const previewContent = entry.content.split('\n').slice(0, 3).join('\n');

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={entry.type === 'learning' ? 'default' : 'secondary'}>
            {entry.type === 'learning' ? (
              <><BookOpen className="h-4 w-4 ml-1" /> למידה</>
            ) : (
              <><BarChart className="h-4 w-4 ml-1" /> מסחר</>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {formatDate(entry.created_at)}
          </span>
        </div>
      </div>

      <div className="prose prose-sm rtl dark:prose-invert max-w-none">
        <div
          dangerouslySetInnerHTML={{
            __html: isExpanded ? entry.content : previewContent
          }}
          className={!isExpanded ? 'line-clamp-3' : ''}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm"
        >
          {isExpanded ? (
            <><ChevronUp className="h-4 w-4 ml-1" /> הצג פחות</>
          ) : (
            <><ChevronDown className="h-4 w-4 ml-1" /> הצג עוד</>
          )}
        </Button>
      </div>
    </Card>
  );
};