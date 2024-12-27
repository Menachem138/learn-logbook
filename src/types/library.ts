export type LibraryItemType = 
  'note' | 
  'link' | 
  'image' | 
  'video' | 
  'whatsapp' | 
  'pdf' | 
  'question' | 
  'youtube' | 
  'image_gallery';

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: {
    path?: string;
    paths?: string[];
    name?: string;
    size?: number;
    type?: string;
  };
  is_starred?: boolean;
  created_at?: string;
}