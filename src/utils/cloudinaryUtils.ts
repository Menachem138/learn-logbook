import { supabase } from '@/integrations/supabase/client';
import { CloudinaryResponse } from '@/types/cloudinary';

export async function uploadToCloudinary(file: File): Promise<CloudinaryResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'content_library');

  // Determine the resource type based on file mime type
  const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  // For PDFs, construct the correct URL
  const url = file.type === 'application/pdf' 
    ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${data.public_id}.pdf`
    : data.secure_url;

  return {
    url,
    publicId: data.public_id,
    resourceType: data.resource_type,
    format: data.format,
    size: data.bytes
  };
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    console.log('Initiating Cloudinary deletion for public ID:', publicId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('Authentication required');
    }

    const response = await fetch('/api/delete-cloudinary-asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Deletion failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}

export function cloudinaryResponseToJson(response: CloudinaryResponse | null): any {
  if (!response) return null;
  return {
    url: response.url,
    publicId: response.publicId,
    resourceType: response.resourceType,
    format: response.format,
    size: response.size
  };
}

const CLOUDINARY_CLOUD_NAME = 'dxrl4mtlw';