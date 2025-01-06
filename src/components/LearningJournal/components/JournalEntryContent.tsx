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
    <div className="space-y-4">
      <div 
        className="prose prose-sm rtl dark:prose-invert"
        onClick={handleClick}
        dangerouslySetInnerHTML={{ 
          __html: isExpanded ? content : truncated 
        }}
      />
      
      {isTruncated && (
        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-navy-800 hover:bg-navy-900 text-white"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>הצג פחות</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>הצג עוד</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};