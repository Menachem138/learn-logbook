export type LibraryItemType = 'link' | 'note' | 'image' | 'video' | 'pdf' | 'whatsapp' | 'question' | 'image_album';

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  created_at: string;
  cloudinary_urls?: Array<{ url: string; publicId: string }>;
  file_details?: {
    path?: string;
    type?: string;
    name?: string;
    size?: number;
  };
  cloudinary_data?: {
    publicId?: string;
    url?: string;
    resourceType?: string;
    format?: string;
    size?: number;
  };
  is_starred?: boolean;
}