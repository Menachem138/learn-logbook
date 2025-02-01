import { supabase } from '@/integrations/supabase/client';

export const uploadFileToStorage = async (file: File, userId: string) => {
  console.log('Uploading file to storage:', { fileName: file.name, userId });
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('content_library')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('content_library')
    .getPublicUrl(filePath);

  return {
    publicUrl,
    filePath,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type
  };
};

export const deleteFileFromStorage = async (filePath: string) => {
  if (!filePath) return;
  
  const { error } = await supabase.storage
    .from('content_library')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};