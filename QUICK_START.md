# Quick Start Guide - You Create

## ✅ Everything is Ready!

All database tables are created, sample data is loaded, edge functions are deployed, and the system is operational.

---

## 🎬 Generate Your First Video (4 Simple Steps)

### 1. Select Exam & Course
- Click on **IIT JAM** exam
- Choose **Mathematical Statistics** course
- See **1 question available**

### 2. Generate & Save Script
- Click **"1. Generate Script"** (blue button)
- Wait 3-5 seconds for AI to create the script
- Review the preview
- Click **"Save to Database"** (green button)

### 3. Generate Audio & Captions
- Click **"2. Generate Voice Over"** - Creates audio (10-15 sec)
- Click **"3. Generate Captions"** - Adds timing (instant)

### 4. Render Video
- Click **"4. Render Final Video"** - Prepares spec (instant)

---

## 🎯 What You Get

**Video Structure**:
1. Introduction: "Hello everyone, today we solve a question for IIT JAM..."
2. Question reading with options
3. 5-second countdown with question on screen
4. Answer reveal with green checkmark
5. Solution explanation
6. Call-to-action

**Features**:
- Word-by-word caption highlighting (yellow background)
- Countdown timer: 5...4...3...2...1
- Question display during countdown
- Answer and solution from database
- Rotating templates (1-5)

---

## 📊 Current System Status

✅ Database: All tables created with proper schema
✅ Sample Data: IIT JAM exam with 1 test question
✅ Edge Functions: Deployed (generate-captions, render-video)
✅ API Keys: Configured (Gemini, ElevenLabs)
✅ Frontend: Complete 4-step pipeline UI
✅ Question Tracking: Automatic `used_in_video` marking

---

## 🔧 Only One Thing to Do

### Create Supabase Storage Bucket

1. Go to your Supabase Dashboard: https://qrztkowqeqzmfgrjfyra.supabase.co
2. Navigate to **Storage** in left sidebar
3. Click **"New bucket"**
4. Name it: `videos`
5. Toggle **Public bucket** to ON
6. Click **Create bucket**

This bucket will store voice-over audio files.

---

## 🚀 Add More Questions

### Reset Test Question
To use the same question again:
```sql
UPDATE new_questions SET used_in_video = null WHERE id = 1;
```

### Add New Questions
```sql
INSERT INTO new_questions (
  topic_id,
  question_statement,
  question_type,
  options,
  answer,
  solution
) VALUES (
  1,
  'What is 2 + 2?',
  'MCQ',
  'Option A: 3, Option B: 4, Option C: 5, Option D: 6',
  '4',
  'Simple addition: 2 + 2 = 4'
);
```

---

## 📈 How It Works

### Script Generation:
- Fetches question from database
- Gets exam name automatically
- Sends to Gemini AI
- Creates conversational script
- Shows preview before saving

### Database Updates:
- Saves script to `videos.script` column
- Marks question as `used_in_video = 'yes'`
- Question won't appear again

### Voice Over:
- Sends script to ElevenLabs
- Voice ID: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`
- Uploads audio to Supabase Storage
- Returns public URL

### Captions:
- Splits script into words
- Calculates precise timing
- Creates word-level timestamps
- Each word gets highlight timing

### Video Rendering:
- Fetches question data
- Creates rendering specification
- Includes all elements:
  - Audio overlay
  - Caption highlighting
  - Countdown animation
  - Question display
  - Answer reveal
  - Solution explanation

---

## 🎓 You're Ready!

Everything is configured and operational. Just create the storage bucket and start generating videos!

See `SETUP_COMPLETE.md` for detailed documentation.
