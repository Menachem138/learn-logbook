export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_album' | 'image_gallery' | 'gallery' | 'audio';

export interface FileDetails {
  path?: string;
  paths?: string[];
  name?: string;
  names?: string[];
  size?: number;
  type?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: FileDetails;
  cloudinary_urls?: string[];
  cloudinary_data?: any;
  is_starred?: boolean;
  created_at?: string;
}