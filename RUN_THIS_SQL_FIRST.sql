-- ============================================
-- IMPORTANT: Run this SQL in your Supabase SQL Editor FIRST
-- This ensures all required columns exist for the video pipeline
-- ============================================

-- Add template_id to videos table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN template_id int DEFAULT 1;
    RAISE NOTICE 'Added template_id column to videos table';
  ELSE
    RAISE NOTICE 'template_id column already exists in videos table';
  END IF;
END $$;

-- Add used_in_video to new_questions table if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'new_questions' AND column_name = 'used_in_video'
  ) THEN
    ALTER TABLE new_questions ADD COLUMN used_in_video text DEFAULT null;
    RAISE NOTICE 'Added used_in_video column to new_questions table';
  ELSE
    RAISE NOTICE 'used_in_video column already exists in new_questions table';
  END IF;
END $$;

-- Verify all columns exist
SELECT
  table_name,
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('videos', 'new_questions')
ORDER BY table_name, ordinal_position;

-- Check if storage bucket exists (run this separately in SQL editor)
-- If this returns empty, you need to create the 'videos' bucket in Storage
SELECT * FROM storage.buckets WHERE name = 'videos';

RAISE NOTICE '✅ Migration complete! Check the results above.';
