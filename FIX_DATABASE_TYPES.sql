-- ============================================
-- CRITICAL FIX: Database Type Corrections
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, let's check current column types
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('videos', 'new_questions', 'exams', 'courses', 'topics')
  AND column_name IN ('id', 'question_id', 'course_id', 'exam_id', 'topic_id')
ORDER BY table_name, column_name;

-- ============================================
-- OPTION 1: If your new_questions.id is UUID
-- Convert videos.question_id to match
-- ============================================

-- Drop existing question_id column if it's the wrong type
DO $$
BEGIN
  -- Check if question_id is integer type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos'
      AND column_name = 'question_id'
      AND data_type = 'integer'
  ) THEN
    -- Drop the integer column
    ALTER TABLE videos DROP COLUMN IF EXISTS question_id;
    RAISE NOTICE 'Dropped integer question_id column';
  END IF;

  -- Add as UUID to match new_questions.id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos'
      AND column_name = 'question_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE videos ADD COLUMN question_id uuid;
    RAISE NOTICE 'Added UUID question_id column';
  END IF;
END $$;

-- ============================================
-- OPTION 2: If your new_questions.id is serial/integer
-- This is the expected setup from migrations
-- No changes needed, just verify
-- ============================================

-- Verify foreign key relationships
DO $$
BEGIN
  -- Add foreign key constraint if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'videos_question_id_fkey'
      AND table_name = 'videos'
  ) THEN
    ALTER TABLE videos
    ADD CONSTRAINT videos_question_id_fkey
    FOREIGN KEY (question_id) REFERENCES new_questions(id);
    RAISE NOTICE 'Added foreign key constraint for question_id';
  END IF;
END $$;

-- ============================================
-- Fix course_id in videos table if needed
-- ============================================

DO $$
BEGIN
  -- Check if course_id exists and is correct type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos'
      AND column_name = 'course_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN course_id integer;
    RAISE NOTICE 'Added course_id column';
  END IF;
END $$;

-- ============================================
-- Add template_id if missing (from previous migration)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN template_id integer DEFAULT 1;
    RAISE NOTICE 'Added template_id column';
  END IF;
END $$;

-- ============================================
-- Add used_in_video if missing (from previous migration)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'new_questions' AND column_name = 'used_in_video'
  ) THEN
    ALTER TABLE new_questions ADD COLUMN used_in_video text DEFAULT null;
    RAISE NOTICE 'Added used_in_video column';
  END IF;
END $$;

-- ============================================
-- Final verification - Check all column types
-- ============================================

SELECT
  'videos' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'videos'
ORDER BY ordinal_position;

SELECT
  'new_questions' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'new_questions'
ORDER BY ordinal_position;

-- ============================================
-- Check if there are any videos records that need cleanup
-- ============================================

SELECT COUNT(*) as video_count FROM videos;
SELECT COUNT(*) as question_count FROM new_questions;

RAISE NOTICE '✅ Database type fixes complete! Check results above.';
