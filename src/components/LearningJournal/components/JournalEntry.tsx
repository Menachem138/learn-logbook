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

const MAX_PREVIEW_LENGTH = 300; // Characters to show in preview

export const JournalEntry = ({ entry, onEdit, onDelete, onSummarize }: JournalEntryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createPreview = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || '';
    
    if (textContent.length <= MAX_PREVIEW_LENGTH) {
      return htmlContent;
    }

    // Find a safe truncation point that doesn't break HTML tags
    let previewHtml = '';
    let currentLength = 0;
    const nodes = Array.from(tempDiv.childNodes);

    for (const node of nodes) {
      const nodeHtml = node.nodeType === Node.TEXT_NODE ? 
        node.textContent : 
        (node as HTMLElement).outerHTML;
        
      if (!nodeHtml) continue;

      if (currentLength + (node.textContent?.length || 0) > MAX_PREVIEW_LENGTH && !isExpanded) {
        break;
      }

      previewHtml += nodeHtml;
      currentLength += node.textContent?.length || 0;
    }

    return isExpanded ? htmlContent : previewHtml;
  };

  const needsExpansion = entry.content.length > MAX_PREVIEW_LENGTH;

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
      
      <div 
        className="prose prose-sm rtl dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: createPreview(entry.content) }}
      />
      
      {needsExpansion && (
        <div className="flex justify-start mt-2">
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
        </div>
      )}
      
      <p className="text-sm text-muted-foreground mt-2">
        {new Date(entry.created_at).toLocaleDateString('he-IL')} {new Date(entry.created_at).toLocaleTimeString('he-IL')}
      </p>
    </Card>
  );
};