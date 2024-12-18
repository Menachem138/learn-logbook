import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary configuration
export const initCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
};

// Upload file to Cloudinary with similar structure to current Supabase implementation
export const uploadFileToCloudinary = async (file: File, userId: string) => {
  try {
    // Convert File to base64 for Cloudinary upload
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.readAsDataURL(file);
    });

    // Upload to Cloudinary with user-specific folder structure
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${base64Data}`,
        {
          folder: `users/${userId}`,
          resource_type: 'auto',
          public_id: `${Date.now()}-${file.name}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Return in the same format as the current implementation
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
