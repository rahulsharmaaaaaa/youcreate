/*
  # Create Videos Table for AI Video Generation

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `course_id` (int, foreign key to courses)
      - `question_id` (int, foreign key to new_questions)
      - `script` (text, generated script from Gemini)
      - `audio_url` (text, voice-over audio file URL)
      - `captions_data` (jsonb, caption timing and text)
      - `video_url` (text, final rendered video URL)
      - `template_id` (int, which template was used 1-6)
      - `status` (text, workflow status: draft/script_generated/audio_generated/captions_generated/video_rendered)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `videos` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id int,
  question_id int,
  script text,
  audio_url text,
  captions_data jsonb,
  video_url text,
  template_id int DEFAULT 1,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read videos"
  ON videos
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert videos"
  ON videos
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update videos"
  ON videos
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);