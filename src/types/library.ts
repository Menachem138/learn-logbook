export type LibraryItemType = 
  | "note"
  | "link"
  | "image"
  | "video"
  | "whatsapp"
  | "pdf"
  | "question"
  | "image_gallery";

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: {
    path?: string;
    paths?: string[];
  };
  is_starred: boolean;
  created_at: string;
}

export interface LibraryItemInput {
  title: string;
  content: string;
  type: LibraryItemType;
  files?: File[];
  file_details?: {
    path?: string;
    paths?: string[];
  };
}

export interface LibraryItemUpdate extends LibraryItemInput {
  id: string;
}