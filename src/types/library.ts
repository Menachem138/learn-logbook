export type LibraryItemType = 'note' | 'link' | 'image' | 'video' | 'youtube' | 'whatsapp' | 'pdf' | 'question';

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
  is_starred?: boolean;
  created_at?: string;
}
