import { supabase } from '@/shared/lib/supabaseClient';

const AVATARS_BUCKET = 'Avatars';

/**
 * Sube a Avatars/{userId}/... — las RLS policies del bucket exigen que el
 * primer segmento del path sea auth.uid(), así que userId no es opcional.
 * Devuelve la public URL para guardar en user_metadata.avatarUrl.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const extension = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar_${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    upsert: true,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path).data.publicUrl;
}
