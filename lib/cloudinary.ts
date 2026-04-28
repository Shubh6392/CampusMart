import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary is configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary credentials not fully configured:', {
    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
  });
}

export async function uploadImage(fileBuffer: Buffer, filename: string): Promise<string> {
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
