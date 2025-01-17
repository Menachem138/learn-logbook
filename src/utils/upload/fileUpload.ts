import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase/client';
import { uploadToCloudinary, pickImage, CloudinaryResponse } from './cloudinaryUpload';

export interface UploadResult {
  url: string;
  fileDetails: {
    name: string;
    size: number;
    type: string;
    cloudinary: {
      public_id: string;
      format: string;
      width: number;
      height: number;
    };
  };
}

export const handleImageUpload = async (): Promise<UploadResult | null> => {
  try {
    const result = await pickImage();
    
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    
    // Upload to Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(asset.uri);
    
    return {
      url: cloudinaryResponse.secure_url,
      fileDetails: {
        name: asset.uri.split('/').pop() || 'image',
        size: asset.fileSize || 0,
        type: asset.type || 'image/jpeg',
        cloudinary: {
          public_id: cloudinaryResponse.public_id,
          format: cloudinaryResponse.format,
          width: cloudinaryResponse.width,
          height: cloudinaryResponse.height,
        },
      },
    };
  } catch (error) {
    console.error('Error handling image upload:', error);
    throw error;
  }
};

export const uploadFileToSupabase = async (
  file: UploadResult,
  bucket: string = 'library'
): Promise<string> => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const filePath = `${user.data.user.id}/${Date.now()}-${file.fileDetails.name}`;
    
    // Convert image URL to blob
    const imageResponse = await fetch(file.url);
    const blob = await imageResponse.blob();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        contentType: file.fileDetails.type,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};
