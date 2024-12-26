export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_album' | 'audio';

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: {
    path?: string;
    name?: string;
    size?: number;
    type?: string;
  };
  cloudinary_urls?: string[];
  cloudinary_data?: any;
  is_starred?: boolean;
  created_at?: string;
}