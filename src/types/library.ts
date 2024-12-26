export type LibraryItemType = 
  | 'note' 
  | 'link' 
  | 'image' 
  | 'video' 
  | 'whatsapp' 
  | 'pdf' 
  | 'question' 
  | 'youtube' 
  | 'image_album' 
  | 'image_gallery'
  | 'audio';  // Added audio type

export interface FileDetails {
  path?: string;
  paths?: string[];
  name?: string;
  names?: string[];
  size?: number;
  type?: string;
}

export type CloudinaryData = {
  secure_url: string;
  public_id: string;
  [key: string]: any;
} | null;

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: LibraryItemType;
  file_details?: FileDetails;
  cloudinary_urls?: string[];
  cloudinary_data?: CloudinaryData;
  is_starred?: boolean;
  created_at?: string;
}

export interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "image" | "video";
  src: string;
  title: string;
}

export interface ImageAlbumProps {
  images: string[];
  title: string;
  onEdit?: () => void;
}

export interface MediaCardProps {
  type: LibraryItemType;
  title: string;
  cloudinaryData?: CloudinaryData;
  cloudinaryUrls?: string[] | null;
  fileDetails?: FileDetails | null;
}