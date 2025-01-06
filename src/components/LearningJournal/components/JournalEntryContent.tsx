import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { truncateHtml } from '../utils/htmlTruncation';

interface JournalEntryContentProps {
  content: string;
  onImageClick?: (src: string) => void;
}

export const JournalEntryContent: React.FC<JournalEntryContentProps> = ({
  content,
  onImageClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { truncated, isTruncated } = truncateHtml(content);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      onImageClick?.((target as HTMLImageElement).src);
    }
  };

  return (
    <div className="space-y-2">
      <div 
        className="prose prose-sm rtl dark:prose-invert"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ 
          __html: isExpanded ? content : truncated 
        }}
      />
      
      {isTruncated && (
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
    </div>
  );
};