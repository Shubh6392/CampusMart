import { v2 as cloudinary } from 'cloudinary';

export async function uploadImage(fileBuffer: Buffer, filename: string): Promise<string> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  console.log('Cloudinary config check:', {
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    has_secret: !!CLOUDINARY_API_SECRET
  });
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'campusmart/listings',
        resource_type: 'auto',
        public_id: filename
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Cloudinary error: ${error.message}`));
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );

    uploadStream.on('error', (err: any) => {
      console.error('Upload stream error:', err);
      reject(err);
    });

    uploadStream.end(fileBuffer);
  });
}

export function getOptimizedImageUrl(url: string, width: number = 400, height: number = 400): string {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }

  return cloudinary.url(url, {
    width,
    height,
    crop: 'fill',
    quality: 'auto'
  });
}
