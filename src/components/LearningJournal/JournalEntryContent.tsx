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
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium bg-accent hover:bg-accent/80 text-accent-foreground transition-all duration-200 border-2 hover:border-primary/50"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              הצג פחות
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              הצג עוד
            </>
          )}
        </Button>
      )}
    </div>
  );
}