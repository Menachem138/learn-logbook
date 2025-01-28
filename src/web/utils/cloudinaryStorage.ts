import { CLOUDINARY_CLOUD_NAME } from '../integrations/cloudinary/client';

export interface CloudinaryResponse {
  publicId: string;
  url: string;
  resourceType: string;
  format: string;
  size: number;
}

export const uploadToCloudinary = async (file: File, folder: string = 'content_library'): Promise<CloudinaryResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'content_library'); // Make sure to create this unsigned upload preset in your Cloudinary settings
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    
    return {
      publicId: data.public_id,
      url: data.secure_url,
      resourceType: data.resource_type,
      format: data.format,
      size: data.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch('/.netlify/functions/delete-cloudinary-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId, timestamp }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    const result = await response.json();
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};