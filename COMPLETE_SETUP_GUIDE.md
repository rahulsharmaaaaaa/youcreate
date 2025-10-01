# Complete Video Pipeline Setup Guide

## Current Status
Your AI automatic video maker is configured and ready. The system uses:
- Supabase for database and storage
- Gemini AI for script generation
- ElevenLabs for voice-over
- Edge Functions for captions and video rendering

## Required: Run This SQL in Supabase

**IMPORTANT**: Before using the system, run this SQL in your Supabase SQL Editor:

```sql
-- Verify and Add Missing Columns for Video Pipeline
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN template_id int DEFAULT 1;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'new_questions' AND column_name = 'used_in_video'
  ) THEN
    ALTER TABLE new_questions ADD COLUMN used_in_video text DEFAULT null;
  END IF;
END $$;

-- Verify columns exist
SELECT
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('videos', 'new_questions')
ORDER BY table_name, ordinal_position;
```

## Database Schema Overview

Your database has a complete hierarchical structure:

```
exams (IIT JAM, CMI MSDS, etc.)
  └─> courses (Mathematics, Statistics, etc.)
      └─> subjects (Calculus, Algebra, etc.)
          └─> units
              └─> chapters
                  └─> topics
                      └─> new_questions (with question_statement, options, answer, solution)
```

### Key Tables

**videos table**:
- `id` (uuid) - Primary key
- `course_id` (int) - Links to selected course
- `question_id` (int) - Links to new_questions table
- `script` (text) - Generated script from Gemini AI
- `audio_url` (text) - Voice-over audio file URL
- `captions_data` (jsonb) - Caption timing with word-level data
- `video_url` (text) - Final rendered video URL
- `template_id` (int) - Template used (1-5 rotating)
- `status` (text) - Workflow status tracking

**new_questions table**:
- `id` (serial) - Primary key
- `topic_id` (int) - Links to topics table
- `question_statement` (text) - The question text
- `question_type` (text) - MCQ, MSQ, etc.
- `options` (text) - Available options for MCQ/MSQ
- `answer` (text) - Correct answer
- `solution` (text) - Detailed solution explanation
- `used_in_video` (text) - NULL or 'yes' to track usage

## Complete Video Pipeline Workflow

### Step 1: Generate Script
1. User selects exam → course on frontend
2. System fetches unused question from new_questions (where used_in_video IS NULL)
3. Gemini AI generates script following this structure:
   - "Hello everyone, today we are going to solve a question for [EXAM] entrance exam."
   - "So the question says: [question_statement]"
   - Read options: "Option A: [text], Option B: [text]..."
   - "Try solving this question on your own. I'll give you 5 seconds. [COUNTDOWN: 5...4...3...2...1]"
   - "The answer is: [answer]"
   - Solution explanation: [solution]
   - "If you are looking for a complete guide for [EXAM] or more practice questions and guidance, follow and comment [EXAM] and it will be in your DMs."

4. Script preview shown to user

### Step 2: Save to Database
1. User clicks "Save to Database"
2. Script saved to `videos.script` column
3. Question marked as used: `new_questions.used_in_video = 'yes'`
4. Random template_id assigned (1-5)
5. Status set to 'script_generated'

### Step 3: Generate Voice Over
1. Script sent to ElevenLabs API
2. Audio generated and uploaded to Supabase storage bucket: `videos`
3. Public URL saved to `videos.audio_url`
4. Status updated to 'audio_generated'

### Step 4: Generate Captions
1. Edge function `/functions/v1/generate-captions` called
2. Script split into words and phrases
3. Timing calculated (2.5 words per second average)
4. Caption data generated with:
   - Full phrase text
   - Start/end timestamps
   - Word-level timing for highlighting
5. Saved as JSON to `videos.captions_data`
6. Status updated to 'captions_generated'

### Step 5: Render Final Video
1. Edge function `/functions/v1/render-video` called
2. Comprehensive rendering specification created:
   - Background: Template based on template_id
   - Audio: Voice-over from audio_url
   - Captions: Word-by-word highlighting (yellow on spoken word)
   - Countdown section: Display question and 5-second countdown
   - Answer reveal: Show answer and solution after countdown
3. **Python backend integration** (see below)
4. Final video URL saved to `videos.video_url`
5. Status updated to 'video_rendered'

## Python Backend Integration (Next Step)

The Python backend (`python-backend/video_renderer.py`) needs to be deployed to handle actual video rendering:

### Required Python Libraries
```bash
pip install moviepy opencv-python pillow aeneas supabase-py requests
```

### Environment Variables for Python Backend
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Python Backend Workflow
1. Receive render request from edge function
2. Download audio file from audio_url
3. Load template background (5 templates rotating)
4. Create video with MoviePy:
   - Add background template
   - Overlay audio track
   - Generate captions with FFmpeg ASS format
   - Implement word-by-word highlighting
5. Insert countdown section:
   - Display question_statement
   - Show options (if MCQ/MSQ)
   - Animate countdown: 5, 4, 3, 2, 1
6. Display answer and solution after countdown
7. Render final video (1080p, 30fps, MP4)
8. Upload to Supabase storage
9. Return public URL

### Deployment Options
- Docker container (Dockerfile provided)
- Cloud Run / AWS Lambda
- Dedicated server with GPU for faster rendering

## API Keys Configured

- **Gemini AI**: AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw
- **ElevenLabs**: sk_78d719766a3026b96c79d89fefeac203b978509b03404756
- **Voice ID**: ap2_01771851-fe5d-4e13-a843-a49b28e72ef9

## Storage Buckets Required

Create these buckets in Supabase Storage:
1. **videos** (public) - For audio files and final videos

## Supabase Edge Functions

Two edge functions are configured:

1. **generate-captions** (`/functions/v1/generate-captions`)
   - Generates caption timing and word-level data
   - Input: video_id, audio_url, script
   - Output: captions JSON with timestamps

2. **render-video** (`/functions/v1/render-video`)
   - Prepares rendering specification
   - Fetches question data (answer, solution)
   - Calls Python backend for actual rendering
   - Input: video_id, template_id
   - Output: video_url

## Video Content Structure

Each video follows this exact pattern:

1. **Introduction** (5-10 seconds)
   - "Hello everyone, today we are going to solve a question for [EXAM] entrance exam."

2. **Question Display** (15-30 seconds)
   - "So the question says: [question_statement]"
   - Read options if MCQ/MSQ

3. **Countdown Break** (5 seconds)
   - "Try solving this question on your own. I'll give you 5 seconds."
   - Visual countdown: 5...4...3...2...1
   - Question remains on screen

4. **Answer Reveal** (3-5 seconds)
   - "The answer is: [answer]"
   - Green checkmark or highlight

5. **Solution Explanation** (30-60 seconds)
   - Detailed solution from database
   - Step-by-step explanation

6. **Call to Action** (5 seconds)
   - "If you are looking for a complete guide for [EXAM] or more practice questions and guidance, follow and comment [EXAM] and it will be in your DMs."

## Features Implemented

✅ Hierarchical exam/course/subject structure
✅ Question selection system (auto-selects unused questions)
✅ AI script generation with Gemini
✅ Script preview and database save
✅ Question usage tracking (used_in_video column)
✅ ElevenLabs voice-over generation
✅ Caption generation with word-level timing
✅ Template rotation system (1-5)
✅ Complete rendering specification
✅ Status tracking throughout pipeline

## Next Steps to Complete

1. **Run the SQL migration above** in Supabase SQL Editor
2. Create storage bucket named `videos` (if not exists)
3. Add sample data to your database:
   - Add exams (IIT JAM, CMI MSDS)
   - Add courses linked to exams
   - Add questions with proper hierarchy
4. Deploy Python backend for video rendering
5. Update render-video edge function with Python backend URL

## Testing the System

1. Start the frontend application
2. Select an exam from dropdown
3. Select a course
4. System loads an unused question
5. Click "Generate Script" - Gemini AI creates script
6. Review script preview
7. Click "Save to Database" - Script saved, question marked as used
8. Click "Generate Voice Over" - ElevenLabs creates audio
9. Click "Generate Captions" - Caption timing calculated
10. Click "Render Final Video" - Python backend renders video
11. Video URL appears when complete

## Troubleshooting

**Issue**: "Could not find the 'template_id' column"
**Solution**: Run the SQL migration above in Supabase

**Issue**: Questions repeat in videos
**Solution**: Ensure `used_in_video` column exists and is being updated

**Issue**: Voice-over fails
**Solution**: Verify ElevenLabs API key and voice ID are correct

**Issue**: Video rendering stuck
**Solution**: Check Python backend is running and accessible

## Architecture Summary

```
Frontend (React + TypeScript)
    ↓
Supabase Database (PostgreSQL)
    ↓
Edge Functions (Deno)
    ↓
Python Backend (MoviePy + FFmpeg)
    ↓
Supabase Storage (Final Videos)
```

Your system is ready for video generation once you run the SQL migration!
