import { supabase } from '@/integrations/supabase/client';
import { uploadFileToCloudinary } from './cloudinaryStorage';

export const uploadFileToStorage = async (file: File, userId: string) => {
  console.log('Uploading file to storage:', { fileName: file.name, userId });

  try {
    // Upload to Cloudinary
    const cloudinaryResult = await uploadFileToCloudinary(file, userId);

    // Keep Supabase upload during migration period
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('content_library')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      // Continue with Cloudinary result even if Supabase fails
    }

    // Return Cloudinary URLs but maintain Supabase path for compatibility
    return {
      publicUrl: cloudinaryResult.publicUrl,
      filePath: cloudinaryResult.filePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Error in file upload:', error);
    throw error;
  }
};
