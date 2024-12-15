import * as React from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Italic,
  Underline,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TextEditorToolbarProps {
  onFormatText: (format: string) => void;
  onImageUpload: (file: File) => void;
}

export function TextEditorToolbar({ onFormatText, onImageUpload }: TextEditorToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="flex items-center gap-1 mb-2 p-2 border-b" dir="rtl">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2">
            <span>טקסט רגיל</span>
            <ChevronDown className="h-4 w-4 mr-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFormatText('align-right')}>
            <AlignRight className="h-4 w-4 ml-2" />
            <span>יישור לימין</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatText('align-center')}>
            <AlignCenter className="h-4 w-4 ml-2" />
            <span>יישור למרכז</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatText('align-left')}>
            <AlignLeft className="h-4 w-4 ml-2" />
            <span>יישור לשמאל</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('**')}
          title="מודגש"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('*')}
          title="נטוי"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('__')}
          title="קו תחתון"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-testid="image-upload-input"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImageClick}
          title="העלה תמונה"
          className="flex items-center gap-1"
          data-testid="image-upload-button"
        >
          <Upload className="h-4 w-4" />
          <span>העלה תמונה</span>
        </Button>
      </div>
    </div>
  );
}
