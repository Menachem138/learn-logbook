import { supabase } from '@/integrations/supabase/client';

export interface S3UploadResponse {
  url: string;
  key: string;
  size: number;
  type: string;
}

export const uploadDocument = async (file: File): Promise<S3UploadResponse> => {
  try {
    console.log('Starting document upload:', { fileName: file.name });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // Create unique file path
    const fileExt = file.name.split('.').pop();
    const userId = session.user.id;
    const folderName = crypto.randomUUID();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${folderName}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('content_library')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content_library')
      .getPublicUrl(filePath);

    console.log('Upload successful:', { publicUrl });

    return {
      url: publicUrl,
      key: filePath,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    throw error;
  }
};

export const deleteDocument = async (key: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('content_library')
      .remove([key]);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  }
};