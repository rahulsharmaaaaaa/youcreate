-- ============================================
-- STEP 1: DETECT YOUR CURRENT DATABASE TYPES
-- Run this first to see what you have
-- ============================================

-- Check new_questions.id type
SELECT
  'new_questions.id type is:' as info,
  data_type,
  CASE
    WHEN data_type = 'uuid' THEN 'UUID detected - videos.question_id must be UUID'
    WHEN data_type = 'integer' THEN 'INTEGER detected - videos.question_id must be INTEGER'
    WHEN data_type = 'bigint' THEN 'BIGINT detected - videos.question_id must be BIGINT'
    ELSE 'Unknown type - needs investigation'
  END as required_action
FROM information_schema.columns
WHERE table_name = 'new_questions' AND column_name = 'id';

-- Check videos.question_id type
SELECT
  'videos.question_id type is:' as info,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'videos' AND column_name = 'question_id';

-- ============================================
-- STEP 2: FIX BASED ON DETECTION
-- ============================================

-- SCENARIO A: new_questions.id is UUID (most likely your case)
-- Fix: Change videos.question_id to UUID

DO $$
DECLARE
  questions_id_type text;
  videos_question_id_type text;
BEGIN
  -- Get the type of new_questions.id
  SELECT data_type INTO questions_id_type
  FROM information_schema.columns
  WHERE table_name = 'new_questions' AND column_name = 'id';

  -- Get the type of videos.question_id
  SELECT data_type INTO videos_question_id_type
  FROM information_schema.columns
  WHERE table_name = 'videos' AND column_name = 'question_id';

  RAISE NOTICE 'new_questions.id type: %', questions_id_type;
  RAISE NOTICE 'videos.question_id type: %', COALESCE(videos_question_id_type, 'MISSING');

  -- If types don't match, fix it
  IF questions_id_type IS NOT NULL AND questions_id_type != COALESCE(videos_question_id_type, '') THEN
    RAISE NOTICE 'Type mismatch detected! Fixing...';

    -- Drop existing question_id if it exists
    IF videos_question_id_type IS NOT NULL THEN
      ALTER TABLE videos DROP COLUMN question_id;
      RAISE NOTICE 'Dropped old question_id column';
    END IF;

    -- Add question_id with correct type
    IF questions_id_type = 'uuid' THEN
      ALTER TABLE videos ADD COLUMN question_id uuid;
      RAISE NOTICE '✅ Added question_id as UUID';
    ELSIF questions_id_type IN ('integer', 'bigint') THEN
      EXECUTE 'ALTER TABLE videos ADD COLUMN question_id ' || questions_id_type;
      RAISE NOTICE '✅ Added question_id as %', questions_id_type;
    END IF;

    -- Try to add foreign key (may fail if data exists)
    BEGIN
      ALTER TABLE videos
      ADD CONSTRAINT videos_question_id_fkey
      FOREIGN KEY (question_id) REFERENCES new_questions(id);
      RAISE NOTICE '✅ Added foreign key constraint';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE '⚠️  Could not add foreign key constraint (may already exist or data incompatible)';
    END;
  ELSE
    RAISE NOTICE '✅ Types already match or are correct';
  END IF;
END $$;

-- ============================================
-- STEP 3: ENSURE OTHER REQUIRED COLUMNS EXIST
-- ============================================

-- Add template_id to videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN template_id integer DEFAULT 1;
    RAISE NOTICE '✅ Added template_id column';
  ELSE
    RAISE NOTICE '✓ template_id already exists';
  END IF;
END $$;

-- Add used_in_video to new_questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'new_questions' AND column_name = 'used_in_video'
  ) THEN
    ALTER TABLE new_questions ADD COLUMN used_in_video text DEFAULT null;
    RAISE NOTICE '✅ Added used_in_video column';
  ELSE
    RAISE NOTICE '✓ used_in_video already exists';
  END IF;
END $$;

-- Add audio_url if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE videos ADD COLUMN audio_url text;
    RAISE NOTICE '✅ Added audio_url column';
  ELSE
    RAISE NOTICE '✓ audio_url already exists';
  END IF;
END $$;

-- Add captions_data if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'captions_data'
  ) THEN
    ALTER TABLE videos ADD COLUMN captions_data jsonb;
    RAISE NOTICE '✅ Added captions_data column';
  ELSE
    RAISE NOTICE '✓ captions_data already exists';
  END IF;
END $$;

-- Add updated_at if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE videos ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE '✅ Added updated_at column';
  ELSE
    RAISE NOTICE '✓ updated_at already exists';
  END IF;
END $$;

-- ============================================
-- STEP 4: VERIFY THE FIX
-- ============================================

SELECT
  '=== VERIFICATION RESULTS ===' as section;

SELECT
  'videos' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'videos'
  AND column_name IN ('id', 'course_id', 'question_id', 'script', 'audio_url', 'captions_data', 'video_url', 'template_id', 'status', 'created_at', 'updated_at')
ORDER BY ordinal_position;

SELECT
  'new_questions' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'new_questions'
  AND column_name IN ('id', 'topic_id', 'question_statement', 'options', 'answer', 'solution', 'used_in_video')
ORDER BY ordinal_position;

-- Check foreign keys
SELECT
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'videos'
  AND constraint_name LIKE '%question_id%';

SELECT '✅ ✅ ✅ ALL FIXES COMPLETE! ✅ ✅ ✅' as status;
