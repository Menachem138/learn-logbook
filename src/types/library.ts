export type LibraryItemType = 'note' | 'link' | 'image' | 'gallery' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_gallery' | 'image_album';

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: {
    path?: string | string[];
    name?: string;
    size?: number;
    type?: string;
  };
  cloudinary_data?: {
    publicId?: string;
    url?: string;
    resourceType?: string;
    format?: string;
    size?: number;
  } | null;
  is_starred?: boolean;
  created_at?: string;
  user_id?: string;
}