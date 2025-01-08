import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JournalEntryContentProps {
  content: string;
}

export function JournalEntryContent({ content }: JournalEntryContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [truncatedContent, setTruncatedContent] = useState(content);

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const textContent = doc.body.textContent || '';
    
    if (textContent.length > 200) {
      setShouldShowButton(true);
      if (!isExpanded) {
        const truncated = content.slice(0, 200) + '...';
        setTruncatedContent(truncated);
      } else {
        setTruncatedContent(content);
      }
    } else {
      setShouldShowButton(false);
      setTruncatedContent(content);
    }
  }, [content, isExpanded]);

  return (
    <div className="space-y-2">
      <div 
        className="prose prose-sm rtl dark:prose-invert" 
        dangerouslySetInnerHTML={{ __html: truncatedContent }}
      />
      {shouldShowButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background hover:bg-accent/10 text-accent-foreground transition-all duration-200 rounded-full border border-accent/20 hover:border-accent/40 shadow-sm hover:shadow"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                פחות
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                עוד
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}