export type ContentItemType = 'link' | 'image' | 'whatsapp' | 'video' | 'note' | 'pdf' | 'question' | 'youtube';

export interface ContentItem {
  id: string;
  type: ContentItemType;
  content: string;
  starred: boolean | null;
  user_id: string;
  created_at: string;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  title: string;
  cloudinary_data?: {
    publicId?: string;
    url?: string;
  };
  file_details?: {
    path?: string;
    name?: string;
    size?: number;
    type?: string;
  };
}

export function isContentItemType(type: string): type is ContentItemType {
  return ['link', 'image', 'whatsapp', 'video', 'note', 'pdf', 'question', 'youtube'].includes(type);
}

export function transformToContentItem(raw: any): ContentItem | null {
  if (!raw || !isContentItemType(raw.type)) {
    console.error('Invalid content type:', raw.type);
    return null;
  }

  return {
    id: raw.id,
    type: raw.type,
    content: raw.content,
    starred: raw.is_starred,
    user_id: raw.user_id,
    created_at: raw.created_at,
    file_path: raw.file_path,
    file_name: raw.file_name,
    file_size: raw.file_size,
    mime_type: raw.mime_type,
    title: raw.title || 'Untitled',
    cloudinary_data: raw.cloudinary_data,
    file_details: raw.file_details
  };
}