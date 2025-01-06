import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

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
  onSummarize?: () => void;
}

export const JournalEntry = ({ entry, onEdit, onDelete, onSummarize }: JournalEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const previewLines = 3;
  
  const getPreviewContent = (content: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const textContent = doc.body.textContent || '';
    const lines = textContent.split('\n');
    if (lines.length > previewLines && !isExpanded) {
      return lines.slice(0, previewLines).join('\n') + '...';
    }
    return content;
  };

  return (
    <Card className={`p-4 ${entry.is_important ? 'border-2 border-yellow-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {entry.is_important && (
            <Badge variant="secondary">חשוב</Badge>
          )}
          {entry.type && (
            <Badge variant="outline">
              {entry.type === 'learning' ? 'למידה' : 'מסחר'}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onSummarize && (
            <Button variant="ghost" size="sm" onClick={onSummarize}>
              <BookOpen className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="prose prose-sm rtl dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: getPreviewContent(entry.content) }} />
      </div>
      
      <div className="flex justify-between items-center mt-2">
        {entry.content.split('\n').length > previewLines && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-muted-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 ml-1" />
                הצג פחות
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 ml-1" />
                הצג עוד
              </>
            )}
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          {new Date(entry.created_at).toLocaleDateString('he-IL')} {new Date(entry.created_at).toLocaleTimeString('he-IL')}
        </p>
      </div>
    </Card>
  );
};