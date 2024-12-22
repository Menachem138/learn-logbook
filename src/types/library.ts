export type LibraryItemType = 
  | "note"
  | "link"
  | "image"
  | "video"
  | "whatsapp"
  | "pdf"
  | "question"
  | "youtube"
  | "image_album";

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  is_starred?: boolean;
  created_at?: string;
  file_details?: {
    path: string;
    type?: string;
    name?: string;
    size?: number;
  } | Array<{
    path: string;
    title?: string;
  }>;
  cloudinary_data?: any;
}