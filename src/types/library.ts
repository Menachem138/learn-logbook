export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'question' | 'image_gallery' | 'pdf';

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

export interface LibraryItemInput {
  title: string;
  content: string;
  type: LibraryItemType;
  files?: File[];
  file_details?: LibraryItem['file_details'];
}

export interface LibraryItemUpdate {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  files?: File[];
  file_details?: LibraryItem['file_details'];
}
