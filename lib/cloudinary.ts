import crypto from 'crypto';

export async function uploadImage(fileBuffer: Buffer, filename: string): Promise<string> {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary credentials are not configured');
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'campusmart/listings';
  const public_id = filename;

  const signatureStr = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash('sha256').update(signatureStr).digest('hex');

  const form = new FormData();
  form.append('file', new Blob([new Uint8Array(fileBuffer)]));
  form.append('api_key', CLOUDINARY_API_KEY);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('public_id', public_id);
  form.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Cloudinary upload error:', data);
    throw new Error(data?.error?.message || 'Cloudinary upload failed');
  }

  return data.secure_url;
}

export function getOptimizedImageUrl(url: string, width = 400, height = 400): string {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto/`);
}
