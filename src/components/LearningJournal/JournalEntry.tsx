import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface JournalEntryProps {
  entry: {
    id: string;
    content: string;
    created_at: string;
    is_important: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
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
      <div className="whitespace-pre-wrap" dir="rtl">
        <ReactMarkdown
          components={{
            img: ({ node, ...props }) => (
              <img
                {...props}
                className="max-w-full h-auto rounded-lg my-2"
                loading="lazy"
                alt={props.alt || ''}
              />
            ),
          }}
        >
          {entry.content}
        </ReactMarkdown>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
      </p>
    </Card>
  );
}
