# You Create - AI Automatic Video Maker

An intelligent video generation platform for educational content that automatically creates engaging videos from your question database.

---

## 🎯 What This Does

Automatically generates educational videos with:
- **AI-Generated Scripts** using Gemini 2.0 Pro
- **Professional Voice-Overs** using ElevenLabs TTS
- **Animated Captions** with word highlighting
- **Multiple Templates** (6 rotating designs)
- **Smart Question Tracking** to prevent duplicates

---

## 🚀 Quick Start

### Step 1: Database Setup (Required!)
Run this SQL in your Supabase SQL Editor:

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'question_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN question_id integer;
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
```

### Step 2: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create bucket: `videos` (make it public)

### Step 3: Deploy Edge Functions (Optional)
```bash
supabase functions deploy generate-captions
supabase functions deploy render-video
```

### Step 4: Start Using!
1. Select an exam
2. Select a course
3. Click "Generate Script"
4. Click "Generate Voice Over"
5. Click "Generate Captions"
6. Click "Render Video" (Python backend needed for actual rendering)

---

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   └── VideoCreationPanel.tsx    # Main video generation component
│   ├── types/
│   │   └── database.ts                # TypeScript types for Supabase
│   ├── lib/
│   │   └── supabase.ts                # Supabase client
│   └── App.tsx                        # Main application
├── supabase/
│   ├── migrations/                    # Database migrations
│   └── functions/                     # Edge Functions
│       ├── generate-captions/         # Caption generation
│       └── render-video/              # Video rendering trigger
├── python-backend/                    # Video renderer (to be completed)
├── QUICK_START.md                     # 5-minute setup guide
├── SETUP_INSTRUCTIONS.md              # Detailed setup guide
├── CURRENT_STATUS.md                  # Current project status
└── ROADMAP.md                         # Complete project roadmap
```

---

## ✅ What's Working Now

- ✅ Exam & Course selection from Supabase
- ✅ Smart question selection (only unused questions)
- ✅ AI script generation with Gemini
- ✅ Voice-over generation with ElevenLabs
- ✅ Caption generation with timing
- ✅ Question usage tracking
- ✅ Supabase Storage integration

## ⏳ What's In Progress

- 🟡 Python video renderer (template exists, needs completion)
- 🟡 Template background designs (6 templates needed)
- 🟡 Batch processing automation

---

## 🔑 API Keys

All API keys are configured in the application:

- **Gemini AI**: Script generation
- **ElevenLabs**: Voice generation (Voice ID: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`)
- **Supabase**: Database and storage

---

## 🗃️ Database Schema

### Tables Used (All in Supabase):
- `exams` - Examination list
- `courses` - Courses per exam
- `subjects` - Subjects per course
- `units` - Units per subject
- `chapters` - Chapters per unit
- `topics` - Topics per chapter
- `new_questions` - Questions with `used_in_video` tracking
- `videos` - Generated video records

### Video Record Structure:
```typescript
{
  id: uuid,
  course_id: integer,
  question_id: integer,
  script: text,              // Gemini-generated script
  audio_url: text,           // ElevenLabs voice-over URL
  captions_data: jsonb,      // Timed captions with word-level timing
  video_url: text,           // Final rendered video URL
  template_id: integer,      // Template used (1-6)
  status: text,              // workflow status
  created_at: timestamp,
  updated_at: timestamp
}
```

---

## 🎬 Video Generation Pipeline

### Step 1: Script Generation
- Uses Gemini 2.0 Pro API
- Creates structured educational script
- Includes: intro, question, options, call-to-action, answer, solution
- Saves to Supabase `videos` table
- Marks question as used

### Step 2: Voice-Over Generation
- Sends script to ElevenLabs TTS
- Uses configured voice ID
- Generates MP3 audio file
- Uploads to Supabase Storage
- Saves public URL to database

### Step 3: Caption Generation
- Calls Supabase Edge Function
- Calculates word timing (2.5 words/second)
- Creates readable phrases
- Generates word-level timing for highlighting
- Saves as JSON in database

### Step 4: Video Rendering (Needs Python Backend)
- Downloads audio from storage
- Loads template background
- Adds audio overlay
- Generates animated captions
- Renders 1080x1920 MP4 video
- Uploads to Supabase Storage

---

## 🎨 Template System

6 rotating template designs:
1. **Slate Blue** - Professional academic
2. **Gray Green** - Modern clean
3. **Purple** - Creative engaging
4. **Teal** - Tech-focused
5. **Orange** - Energetic warm
6. **Pink** - Bold attention-grabbing

Templates automatically rotate for variety.

---

## 🛠️ Tech Stack

### Frontend:
- React + TypeScript
- Vite
- Tailwind CSS
- Supabase JS SDK

### Backend:
- Supabase Edge Functions (Deno)
- Python (video rendering)
- MoviePy + FFmpeg (video processing)
- aeneas (caption timing)

### APIs:
- Google Gemini 2.0 Pro
- ElevenLabs TTS
- Supabase (PostgreSQL + Storage)

---

## 📖 Documentation

- **QUICK_START.md** - Get running in 5 minutes
- **SETUP_INSTRUCTIONS.md** - Detailed setup guide with troubleshooting
- **CURRENT_STATUS.md** - Current project state and what's working
- **ROADMAP.md** - Complete development roadmap (5 phases)
- **API_KEYS_SETUP.md** - API configuration reference

---

## 🐛 Troubleshooting

### "Could not find the 'question_id' column"
→ Run the database migration SQL

### "Failed to generate voice-over"
→ Check ElevenLabs API credits and voice ID

### "Storage bucket not found"
→ Create the `videos` bucket in Supabase Storage

### "Failed to generate captions"
→ Deploy the Edge Functions

See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting.

---

## 🎯 Next Steps

1. **Complete Setup** - Follow `QUICK_START.md`
2. **Test Pipeline** - Generate your first video script and audio
3. **Build Python Renderer** - Complete video rendering functionality
4. **Create Templates** - Design 6 background templates
5. **Automate** - Set up batch processing

See `ROADMAP.md` for the complete development plan.

---

## 📊 Project Status

**Phase 1**: ✅ Complete - Foundation & Core Setup
**Phase 2**: 🟡 In Progress - Audio & Captions (needs Edge Functions deployed)
**Phase 3**: 🔴 Pending - Video Rendering (Python backend needed)
**Phase 4**: 🔴 Future - Automation & Scaling
**Phase 5**: 🔴 Future - Production Deployment

---

## 🤝 Contributing

This is a custom EdTech video generation platform. For questions or issues, refer to the documentation files.

---

## 📝 License

Educational use project.

---

## 🚦 Current Limitations

- Video rendering not implemented (Python backend needed)
- No batch processing yet
- No retry logic for failed generations
- Templates not designed yet
- No video preview functionality

All limitations are tracked in `ROADMAP.md` with solutions.

---

**Ready to start?** Open `QUICK_START.md` and follow the 3-step setup!
