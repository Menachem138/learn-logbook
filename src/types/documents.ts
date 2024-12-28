export type DocumentType = 'pdf' | 'word' | 'md';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: DocumentType;
  file_url?: string;
  cloudinary_public_id?: string;
  file_size?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentInput {
  title: string;
  description?: string;
  type: DocumentType;
  file?: File;
}