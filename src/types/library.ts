export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'youtube' | 'image_album';

export interface FileDetails {
  path?: string;
  name?: string;
  size?: number;
  type?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: FileDetails | FileDetails[];
  is_starred?: boolean;
  created_at?: string;
}
