import { supabase } from "@/lib/supabaseClient";

const BUCKET = "card-icons";

/** Allowed image extensions for upload. */
const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);

/**
 * Upload an image file to Supabase Storage (bucket: card-icons).
 * Files are stored at {userId}/{timestamp}-{random}.{ext} so ownership can
 * be determined from the path prefix and collisions are avoided.
 *
 * Returns the public URL of the uploaded file.
 * Throws if Supabase is not configured, userId is missing, the file type is
 * not allowed, or the upload fails.
 */
export async function uploadCardIcon(
  file: File,
  userId: string,
): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!userId) throw new Error("User ID is required.");

  const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(rawExt)) {
    throw new Error(
      `Unsupported file type ".${rawExt}". Allowed: png, jpg, jpeg, gif, webp.`,
    );
  }

  // Random 6-char hex suffix prevents collisions even on rapid re-uploads
  const rand = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  const path = `${userId}/${Date.now()}-${rand}.${rawExt}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

