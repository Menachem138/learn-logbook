import { CloudinaryResponse } from '@/types/cloudinary';
import { CLOUDINARY_CLOUD_NAME } from '../integrations/cloudinary/client';

export const uploadToCloudinary = async (file: File): Promise<CloudinaryResponse> => {
  console.log('Starting Cloudinary upload for file:', file.name);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'content_library');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', data);
    
    return {
      publicId: data.public_id,
      url: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      size: data.bytes,
    };
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

export const cloudinaryResponseToJson = (response: CloudinaryResponse | null) => {
  if (!response) return null;
  return {
    publicId: response.publicId,
    url: response.url,
    resourceType: response.resourceType,
    format: response.format,
    size: response.size,
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    console.log('Initiating Cloudinary deletion for public ID:', publicId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase.functions.invoke('delete-cloudinary-asset', {
      body: { publicId },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      }
    });

    if (error) {
      console.error('Error from Edge Function:', error);
      throw error;
    }

    console.log('Edge Function response:', data);
    return data?.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};