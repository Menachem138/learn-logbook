import { LibraryItemType } from "@/types/library";

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
  cloudinary_urls?: string[];
  cloudinary_data?: {
    secure_url: string;
    public_id: string;
    [key: string]: any;
  };
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
  type: "image" | "video" | "pdf" | "audio" | "image_album";
  title: string;
  cloudinaryData?: {
    secure_url: string;
    public_id: string;
    [key: string]: any;
  } | null;
  cloudinaryUrls?: string[] | null;
  fileDetails?: FileDetails | null;
}