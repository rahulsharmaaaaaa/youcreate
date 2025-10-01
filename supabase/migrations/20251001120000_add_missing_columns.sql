/*
  # Add Missing Columns to Support Video Pipeline

  1. Changes to `videos` table
    - Ensure `question_id` column exists (integer)
    - Purpose: Track which question was used for each video

  2. Changes to `new_questions` table
    - Add `used_in_video` column (text, nullable)
    - Default: null
    - Value: 'yes' when question is used in a video
    - Purpose: Prevent duplicate video generation for same question
*/

-- Add question_id to videos table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'question_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN question_id integer;
  END IF;
END $$;

-- Add used_in_video to new_questions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'new_questions' AND column_name = 'used_in_video'
  ) THEN
    ALTER TABLE new_questions ADD COLUMN used_in_video text DEFAULT null;
  END IF;
END $$;
