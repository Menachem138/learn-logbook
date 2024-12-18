import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs';

// Initialize Cloudinary configuration
export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

// Helper type for file input
type FileInput = File | { path: string; name: string; type: string; size: number };

// Upload file to Cloudinary with support for both browser File and Node.js file path
export const uploadFileToCloudinary = async (
  file: FileInput,
  userId: string
): Promise<UploadResult> => {
  try {
    let uploadPromise: Promise<any>;

    if ('path' in file) {
      // Node.js environment - use file path
      uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path,
          {
            folder: `users/${userId}`,
            resource_type: 'auto',
            public_id: `${Date.now()}-${file.name}`,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });
    } else {
      // Browser environment - use File object
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      uploadPromise = new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          `data:${file.type};base64,${base64Data}`,
          {
            folder: `users/${userId}`,
            resource_type: 'auto',
            public_id: `${Date.now()}-${file.name}`,
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });
    }

    const result = await uploadPromise;

    return {
      publicUrl: result.secure_url,
      filePath: result.public_id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    };
  } catch (error) {
    console.error('Error uploading file to Cloudinary:', error);
    throw error;
  }
};

// Helper type for uploadFileToCloudinary return value
export type UploadResult = {
  publicUrl: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};
