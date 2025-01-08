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
    
    // Check if content needs truncation (more than 3 lines, roughly 200 characters)
    if (textContent.length > 200) {
      setShouldShowButton(true);
      if (!isExpanded) {
        // Truncate the content while preserving HTML
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
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full flex items-center justify-center gap-1 py-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              הצג פחות
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              הצג עוד
            </>
          )}
        </Button>
      )}
    </div>
  );
}