-- RoutineNest — STEP 22: card-icons Supabase Storage bucket + RLS policies
-- Creates a public bucket for card icon images.
-- Files are stored as {userId}/{timestamp}.{ext} so ownership is path-encoded.
-- This migration is idempotent: safe to run multiple times.

-- 1. Bucket (public so images can be served without a signed URL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-icons', 'card-icons', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Public SELECT — anyone can read icons (image URLs need no auth token)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read card-icons'
  ) THEN
    CREATE POLICY "Public read card-icons"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'card-icons');
  END IF;
END $$;

-- 3. Authenticated INSERT — any logged-in user may upload
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated insert card-icons'
  ) THEN
    CREATE POLICY "Authenticated insert card-icons"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'card-icons');
  END IF;
END $$;

-- 4. Owner UPDATE — user may overwrite their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner update card-icons'
  ) THEN
    CREATE POLICY "Owner update card-icons"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'card-icons'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- 5. Owner DELETE — user may delete their own files
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Owner delete card-icons'
  ) THEN
    CREATE POLICY "Owner delete card-icons"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'card-icons'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;
