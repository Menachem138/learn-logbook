import { CloudinaryResponse } from '@/types/cloudinary';

export function isCloudinaryResponse(obj: unknown): obj is CloudinaryResponse {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'publicId' in obj &&
    'url' in obj &&
    'resourceType' in obj &&
    'format' in obj &&
    'size' in obj &&
    typeof (obj as CloudinaryResponse).publicId === 'string' &&
    typeof (obj as CloudinaryResponse).url === 'string' &&
    typeof (obj as CloudinaryResponse).resourceType === 'string' &&
    typeof (obj as CloudinaryResponse).format === 'string' &&
    typeof (obj as CloudinaryResponse).size === 'number'
  );
}