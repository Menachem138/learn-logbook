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

export interface ImageDetails {
  path: string;
  title?: string;
  type?: string;
  name?: string;
  size?: number;
}

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  is_starred?: boolean;
  created_at?: string;
  file_details?: ImageDetails | ImageDetails[];
  cloudinary_data?: any;
}