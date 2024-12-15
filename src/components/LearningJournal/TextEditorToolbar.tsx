import React from 'react';
import { Button } from "@/components/ui/button";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TextEditorToolbarProps {
  onFormatText: (format: string) => void;
  onImageUpload: (file: File) => void;
}

export function TextEditorToolbar({ onFormatText, onImageUpload }: TextEditorToolbarProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
          <Button variant="ghost" size="sm" className="flex gap-2">
            טקסט רגיל
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            טקסט רגיל
          </DropdownMenuItem>
          <DropdownMenuItem>
            כותרת
          </DropdownMenuItem>
          <DropdownMenuItem>
            כותרת משנית
          </DropdownMenuItem>
          <DropdownMenuItem>
            תת-כותרת
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('align-right')}
          title="יישור לימין"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('align-center')}
          title="יישור למרכז"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('align-left')}
          title="יישור לשמאל"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('quote')}
          title="ציטוט"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('bullet-list')}
          title="רשימה"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFormatText('numbered-list')}
          title="רשימה ממוספרת"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r pr-2 mr-2">
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
        />
        <Button
          variant="ghost"
          size="sm"
          title="הוסף תמונה"
          onClick={handleImageClick}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
