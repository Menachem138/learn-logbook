export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_album';

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
  cloudinary_data?: {
    publicId?: string;
    url?: string;
  };
  cloudinary_urls?: { url: string; publicId: string }[];
  is_starred?: boolean;
  created_at?: string;
  user_id: string;
}