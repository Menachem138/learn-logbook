import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { toast } from "sonner"
import { supabase } from '@/integrations/supabase/client'
import { uploadFileToStorage } from '@/utils/fileStorage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Quote,
  ChevronDown,
  ImageIcon,
  ListOrdered,
  List
} from 'lucide-react'

interface EditorProps {
  content: string
  onChange: (content: string) => void
  onClear?: () => void
}

const Editor: React.FC<EditorProps> = ({ content, onChange, onClear }) => {
  const [isUploading, setIsUploading] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'right',
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onCreate: ({ editor }) => {
      if (!content) {
        editor.commands.setContent('')
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg rtl w-full min-h-[250px] overflow-y-auto p-4 focus:outline-none',
        dir: 'rtl',
      },
    },
  })

  React.useEffect(() => {
    if (editor && !content) {
      editor.commands.setContent('')
      onClear?.();
    }
  }, [editor, content, onClear])

  const addImage = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast.error("יש להתחבר כדי להוסיף תמונות");
        return;
      }

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          toast.error("נא להעלות קובץ תמונה בלבד");
          return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error("גודל התמונה חייב להיות קטן מ-5MB");
          return;
        }

        setIsUploading(true);
        try {
          const { publicUrl } = await uploadFileToStorage(file, session.session.user.id);
          if (editor) {
            editor.chain().focus().setImage({ src: publicUrl }).run();
            toast.success("התמונה הועלתה בהצלחה!");
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error("שגיאה בהעלאת התמונה");
        } finally {
          setIsUploading(false);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error in addImage:', error);
      toast.error("שגיאה בהעלאת התמונה");
    }
  };

  if (!editor) return null;

  return (
    <div className="border rounded-lg w-full">
      <div className="flex items-center gap-2 border-b p-3 bg-gray-50/80 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-right px-3 font-normal">
              טקסט רגיל
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[120px]">
            {[
              { label: 'טקסט רגיל', command: () => editor.chain().focus().setParagraph().run() },
              { label: 'כותרת', command: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
              { label: 'כותרת משנית', command: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
              { label: 'תת-כותרת', command: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
            ].map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={option.command}
                className="text-right px-3 py-2"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-4 w-[1px] bg-gray-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 ${editor.isActive('bold') ? 'bg-gray-100' : ''}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 ${editor.isActive('italic') ? 'bg-gray-100' : ''}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 ${editor.isActive('underline') ? 'bg-gray-100' : ''}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-[1px] bg-gray-200 mx-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 ${editor.isActive('orderedList') ? 'bg-gray-100' : ''}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 ${editor.isActive('bulletList') ? 'bg-gray-100' : ''}`}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-[1px] bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={addImage}
          className="px-2"
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="w-full max-h-[60vh] overflow-y-auto">
        <EditorContent editor={editor} className="prose prose-lg max-w-none w-full" />
      </div>
    </div>
  );
}

export default Editor;
