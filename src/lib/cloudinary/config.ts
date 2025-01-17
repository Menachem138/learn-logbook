import { Cloudinary } from '@cloudinary/url-gen';

const CLOUDINARY_CLOUD_NAME = 'learn-logbook';
const CLOUDINARY_UPLOAD_PRESET = 'mobile_uploads';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});

export const CLOUDINARY_CONFIG = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
  apiKey: CLOUDINARY_API_KEY,
};
