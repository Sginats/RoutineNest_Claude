-- RoutineNest — STEP 22: card-icons Supabase Storage bucket + RLS policies
-- Creates a public bucket for card icon images.
-- Files are stored as {userId}/{timestamp}.{ext} so ownership is path-encoded.

-- 1. Bucket (public so images can be displayed without a signed URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-icons', 'card-icons', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public SELECT — anyone can read icons (they appear in kid screens)
CREATE POLICY "Public read card-icons"
ON storage.objects FOR SELECT
USING (bucket_id = 'card-icons');

-- 3. Authenticated INSERT — any logged-in user may upload
CREATE POLICY "Authenticated insert card-icons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'card-icons');

-- 4. Owner UPDATE — user may overwrite their own files
CREATE POLICY "Owner update card-icons"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'card-icons'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Owner DELETE — user may delete their own files
CREATE POLICY "Owner delete card-icons"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'card-icons'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
