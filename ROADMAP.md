# You Create - AI Video Maker Roadmap

## Project Overview
An AI-powered automatic video maker for educational content that generates videos from your question database with automated scripts, voice-overs, captions, and multiple rotating templates.

---

## Phase 1: Foundation & Core Setup ✅ COMPLETED

### What We Built:
1. **Database Integration**
   - Connected to existing Supabase database
   - Implemented hierarchical data structure: Exams → Courses → Subjects → Units → Chapters → Topics → Questions
   - Added tracking system to prevent duplicate video generation

2. **Frontend UI**
   - Simple, clean interface with exam and course selection
   - Real-time question counter showing available unused questions
   - Visual pipeline for 4-step video creation process
   - Connection status monitoring

3. **Script Generation (Step 1)**
   - Integrated Gemini 2.0 Pro API for intelligent script generation
   - Educational format with proper structure:
     - Introduction with exam name
     - Question reading
     - Options dictation
     - Call-to-action for engagement
     - Answer reveal with 5-second pause
     - Solution explanation

4. **Database Schema**
   - Created `videos` table with complete workflow tracking
   - Implemented status management (draft → script_generated → audio_generated → captions_generated → video_rendered)
   - Added template rotation system (1-6 templates)

---

## Phase 2: Audio & Captions 🟡 IN PROGRESS

### Current Status:
- ✅ Voice-over integration ready (needs API key)
- ✅ Caption generation with timing algorithm
- ✅ Supabase Edge Functions deployed
- ⚠️ **BLOCKED**: Requires ElevenLabs API key

### What's Working:
1. **Voice-Over System (Step 2)**
   - ElevenLabs TTS integration configured
   - Voice ID specified: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`
   - Automatic audio upload to Supabase Storage
   - **ACTION NEEDED**: Add your ElevenLabs API key to `VideoCreationPanel.tsx` line 27

2. **Caption Generation (Step 3)**
   - Smart word timing algorithm (2.5 words/second)
   - Phrase grouping for readability
   - Word-level timing for highlighting effects
   - JSON storage for caption data

### Next Steps:
- [ ] Add ElevenLabs API key
- [ ] Create Supabase Storage bucket named `videos`
- [ ] Test voice-over generation
- [ ] Test caption timing accuracy

---

## Phase 3: Video Rendering 🔴 PENDING

### What Needs to Be Built:
1. **Python Backend Worker**
   - Install dependencies: MoviePy, FFmpeg, Pillow, aeneas
   - Configure Supabase credentials
   - Implement video rendering logic
   - Upload final videos to storage

2. **Template System**
   - Create 6 different template backgrounds:
     1. Slate Blue - Professional academic
     2. Gray Green - Modern clean
     3. Purple - Creative engaging
     4. Teal - Tech-focused
     5. Orange - Energetic warm
     6. Pink - Bold attention-grabbing
   - Implement template rotation

3. **Video Rendering Process**
   - Download audio from Supabase
   - Load template background
   - Add audio overlay
   - Generate animated captions with word highlighting
   - Render final 1080x1920 MP4 (vertical format)
   - Upload to Supabase Storage

### Files Ready:
- `python-backend/video_renderer.py` - Template ready, needs completion
- `python-backend/requirements.txt` - Dependencies listed
- `python-backend/README.md` - Instructions provided

### Action Items:
- [ ] Complete Python video renderer implementation
- [ ] Create 6 template background images
- [ ] Implement caption animation with highlighting
- [ ] Test video rendering locally
- [ ] Set up automated worker process

---

## Phase 4: Automation & Scaling 🔴 FUTURE

### Goals:
1. **Batch Processing**
   - Automatic question selection
   - Queue-based video generation
   - Progress tracking dashboard
   - Error handling and retry logic

2. **Worker Automation**
   - Docker containerization
   - Cron job scheduling
   - Auto-process videos in queue
   - Email notifications on completion

3. **Template Management**
   - Admin interface for template selection
   - Custom template upload
   - A/B testing different templates
   - Analytics on template performance

4. **Quality Control**
   - Preview before finalizing
   - Manual script editing
   - Voice-over regeneration
   - Caption timing adjustment

### Future Features:
- [ ] Bulk video generation (process 10-50 videos at once)
- [ ] Custom branding per course/exam
- [ ] Multiple voice options
- [ ] Background music support
- [ ] Thumbnail generation
- [ ] Direct social media publishing
- [ ] Video analytics dashboard

---

## Phase 5: Production Deployment 🔴 FUTURE

### Deployment Tasks:
1. **Frontend Deployment**
   - Deploy to Vercel/Netlify
   - Environment variable configuration
   - Custom domain setup

2. **Backend Deployment**
   - Dockerize Python worker
   - Deploy to cloud (AWS/Google Cloud/DigitalOcean)
   - Set up continuous processing
   - Configure monitoring and logging

3. **Database Optimization**
   - Add indexes for faster queries
   - Implement caching
   - Set up database backups
   - Monitor performance

4. **Security & Performance**
   - API rate limiting
   - Key rotation strategy
   - CDN for video delivery
   - Cost optimization

---

## Current Priorities

### Immediate (This Week):
1. **Add ElevenLabs API Key** - Required to test voice generation
2. **Run Database Migration** - Add `used_in_video` column to `new_questions` table
3. **Create Supabase Storage Bucket** - Named `videos`, set to public
4. **Test Script Generation** - Verify Gemini API is working correctly

### Short Term (Next 2 Weeks):
1. **Complete Python Video Renderer** - Core functionality for rendering
2. **Create Template Backgrounds** - Design 6 template variations
3. **Test Complete Pipeline** - End-to-end test from script to video
4. **Implement Batch Processing** - Generate multiple videos automatically

### Medium Term (Next Month):
1. **Automation Setup** - Docker + Cron job for continuous processing
2. **Quality Control Interface** - Preview and approve videos
3. **Performance Optimization** - Speed up rendering process
4. **Analytics Dashboard** - Track video generation metrics

---

## Technical Stack Summary

### Frontend:
- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database Client**: Supabase JS SDK

### Backend:
- **Serverless**: Supabase Edge Functions (Deno)
- **Video Processing**: Python + MoviePy + FFmpeg
- **Caption Timing**: aeneas library
- **Storage**: Supabase Storage

### APIs:
- **Script Generation**: Google Gemini 2.0 Pro
- **Voice-Over**: ElevenLabs TTS API
- **Database**: Supabase (PostgreSQL)

### Infrastructure:
- **Database**: Supabase (already provisioned)
- **Storage**: Supabase Storage buckets
- **Edge Functions**: Supabase Functions
- **Worker**: Python backend (needs deployment)

---

## Known Issues & Blockers

### Critical:
1. ⚠️ **ElevenLabs API Key Missing** - Cannot generate voice-overs
2. ⚠️ **Database Migration Needed** - `used_in_video` column must be added
3. ⚠️ **Storage Bucket** - `videos` bucket needs to be created
4. ⚠️ **Python Backend Incomplete** - Video rendering not implemented

### Minor:
- Edge Functions return mock data for video rendering (Python backend needed)
- No error recovery for failed generations
- No progress indicator for long-running tasks
- Template images not created yet

---

## Success Metrics

### Phase 1-2 Goals:
- [x] Successfully connect to Supabase
- [x] Select exam and course
- [x] Generate script with Gemini
- [ ] Generate voice-over with ElevenLabs
- [ ] Generate captions with timing

### Phase 3 Goals:
- [ ] Render first complete video
- [ ] Implement all 6 templates
- [ ] Process 10 videos successfully
- [ ] Average render time < 5 minutes per video

### Phase 4 Goals:
- [ ] Fully automated pipeline
- [ ] Process 100+ videos without intervention
- [ ] Template rotation working correctly
- [ ] Zero data loss or corruption

---

## Questions & Decisions Needed

1. **Template Design**: Do you have specific design requirements or brand guidelines?
2. **Voice Selection**: Is the voice ID `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9` the one you want to use?
3. **Video Format**: Confirm 1080x1920 (vertical/portrait) is correct for your platform?
4. **Deployment**: Where do you plan to deploy the Python worker?
5. **Volume**: How many videos do you plan to generate per day/week?

---

## Next Session Plan

When you're ready to continue:

1. **Add ElevenLabs API Key** to the project
2. **Run Database Migration** (copy SQL from API_KEYS_SETUP.md)
3. **Test Voice-Over Generation** to ensure it works
4. **Start Python Backend Implementation** for video rendering
5. **Create First Template Background** to test the rendering

Let me know which phase you want to focus on next!
