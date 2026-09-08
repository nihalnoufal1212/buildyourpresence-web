import { supabase } from './supabase';

const BUCKET = 'business-images';
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return 'Please use JPG, PNG, WebP, or GIF.';
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be under 4 MB.';
  }
  return null;
}

export async function uploadImage(
  userId: string,
  file: File,
  kind: 'logo' | 'product'
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function removeImage(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    const bucketIdx = parts.indexOf(BUCKET);
    if (bucketIdx === -1) return;
    const filePath = parts.slice(bucketIdx + 1).join('/');
    if (!filePath) return;
    await supabase.storage.from(BUCKET).remove([filePath]);
  } catch {
    // best-effort cleanup
  }
}
