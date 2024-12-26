export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'whatsapp' | 'pdf' | 'question' | 'image_album';

export interface LibraryItem {
  id: string;
  user_id: string;
  type: LibraryItemType;
  title: string;
  content: string;
  is_starred?: boolean;
  created_at: string;
  file_details?: {
    path?: string;
    images?: { path: string; title: string }[];
  };
}