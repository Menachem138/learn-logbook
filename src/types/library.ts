export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_gallery';

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
  is_starred?: boolean;
  created_at?: string;
}