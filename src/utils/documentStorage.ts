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

    // Create FormData with the file
    const formData = new FormData();
    formData.append('file', file);

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke('s3-upload', {
      body: formData,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No response data from upload function');
    }

    console.log('Upload successful:', data);
    return data as S3UploadResponse;
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    throw error;
  }
};

export const deleteDocument = async (key: string): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { error } = await supabase.functions.invoke('s3-delete', {
      body: { key },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDocument:', error);
    throw error;
  }
};