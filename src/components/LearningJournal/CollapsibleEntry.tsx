import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleEntryProps {
  entry: {
    id: string;
    content: string;
    created_at: string;
    is_important: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onGenerateSummary: () => void;
}

export function CollapsibleEntry({ entry, onEdit, onDelete, onGenerateSummary }: CollapsibleEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLength = 200; // Show first 200 characters as preview
  const hasMoreContent = entry.content.length > previewLength;

  const getPreviewContent = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(entry.content, 'text/html');
    const textContent = doc.body.textContent || '';
    return isExpanded ? entry.content : textContent.slice(0, previewLength) + (hasMoreContent ? '...' : '');
  };

  return (
    <Card className={`p-4 ${entry.is_important ? 'border-2 border-yellow-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2">
          {entry.is_important && (
            <Badge variant="secondary">חשוב</Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerateSummary}
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className={`prose prose-sm rtl dark:prose-invert ${!isExpanded ? 'line-clamp-3' : ''}`}
        dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
      />
      
      {hasMoreContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 ml-2" />
              הצג פחות
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 ml-2" />
              הצג עוד
            </>
          )}
        </Button>
      )}
      
      <p className="text-sm text-muted-foreground mt-2">
        {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
      </p>
    </Card>
  );
}