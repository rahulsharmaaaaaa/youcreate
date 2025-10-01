# API Keys and Configuration Guide

This document explains where to add API keys and configure the system.

## CRITICAL: Database Setup Required First!

⚠️ **YOU MUST RUN THE DATABASE MIGRATION BEFORE USING THE APP**

See `SETUP_INSTRUCTIONS.md` for detailed step-by-step guide.

Quick Setup:
1. Run SQL migration in Supabase (adds required columns)
2. Create `videos` storage bucket (public)
3. Deploy Edge Functions

## API Keys Status

### 1. Gemini API Key ✅ CONFIGURED
- **Current Key**: `AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw`
- **Location**: `src/components/VideoCreationPanel.tsx` line 26
- **Purpose**: Generates engaging educational video scripts
- **Usage**: Script generation (Step 1 of video pipeline)

### 2. ElevenLabs API Key ✅ CONFIGURED
- **Current Key**: `sk_78d719766a3026b96c79d89fefeac203b978509b03404756`
- **Location**: `src/components/VideoCreationPanel.tsx` line 27
- **Voice ID**: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`
- **Purpose**: Text-to-speech voice-over generation
- **Provider**: ElevenLabs (https://elevenlabs.io)

### 3. Supabase Configuration (Already Set ✅)
- **URL**: Already in `.env` file
- **Anon Key**: Already in `.env` file
- **Service Role Key**: Needed for Python backend (see below)

### 4. Python Backend Configuration ⚠️ REQUIRED
Edit `python-backend/video_renderer.py` lines 23-26:

```python
SUPABASE_URL = "https://0ec90b57d6e95fcbda19832f.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"  # Get from Supabase Dashboard
VOICE_API_KEY = "YOUR_VOICE_API_KEY"  # Same as frontend
```

**To Get Service Role Key**:
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy "service_role" key (⚠️ Keep this secret!)

## Frontend Configuration Steps

### Step 1: Update Voice API Configuration

Open `src/components/VideoCreationPanel.tsx` and update:

```typescript
// Line 22
const VOICE_API_KEY = 'YOUR_ELEVENLABS_API_KEY';

// Line 75 - Update the endpoint
const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`, {
  method: 'POST',
  headers: {
    'xi-api-key': VOICE_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: videoRecord.script,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75
    }
  })
});
```

### Step 2: Create Supabase Storage Bucket

1. Go to Supabase Dashboard
2. Storage → Create new bucket
3. Name: `videos`
4. Make it **public**
5. Save

## Backend Configuration Steps

### Step 1: Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### Step 2: Install System Dependencies

**Ubuntu/Debian**:
```bash
sudo apt-get install ffmpeg imagemagick
```

**macOS**:
```bash
brew install ffmpeg imagemagick
```

**Windows**: Download and install manually:
- FFmpeg: https://ffmpeg.org/download.html
- ImageMagick: https://imagemagick.org/script/download.php

### Step 3: Update Configuration

Edit `python-backend/video_renderer.py`:

```python
SUPABASE_URL = "https://0ec90b57d6e95fcbda19832f.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY_HERE"
VOICE_API_KEY = "YOUR_ELEVENLABS_API_KEY_HERE"
```

### Step 4: Run the Backend

```bash
python video_renderer.py
```

Or run continuously:
```bash
while true; do python video_renderer.py; sleep 30; done
```

## Complete Video Generation Pipeline

### How It Works:

1. **Select Exam & Course** (Frontend)
   - Choose exam from dropdown
   - Select course
   - System fetches random question

2. **Generate Script** (Button 1)
   - Uses Gemini AI to create engaging script
   - Saves to Supabase `videos` table
   - Status: `script_generated`

3. **Generate Voice-Over** (Button 2)
   - Sends script to ElevenLabs TTS
   - Receives MP3 audio
   - Uploads to Supabase Storage
   - Saves URL to database
   - Status: `audio_generated`

4. **Generate Captions** (Button 3)
   - Calls Supabase Edge Function
   - Creates timed captions from script
   - Estimates word timing (2.5 words/second)
   - Saves caption data as JSON
   - Status: `captions_generated`

5. **Render Video** (Button 4)
   - Triggers Python backend worker
   - Downloads audio
   - Creates template background (1 of 6)
   - Adds animated captions with highlighting
   - Renders final MP4 (1080x1920, 30fps)
   - Uploads to Supabase Storage
   - Status: `video_rendered`

## Video Templates

6 rotating templates with different color schemes:

1. **Slate Blue** - Academic, professional
2. **Gray Green** - Modern, clean
3. **Purple** - Creative, engaging
4. **Teal** - Tech-focused
5. **Orange** - Energetic, warm
6. **Pink** - Bold, attention-grabbing

Templates automatically rotate for variety.

## Testing the System

### Test Script Generation:
1. Open the app
2. Select an exam and course
3. Click "Generate Script"
4. Check Supabase → Videos table
5. Should see new row with script text

### Test Voice-Over:
1. After script generation succeeds
2. Click "Generate Voice Over"
3. Check Supabase → Storage → videos
4. Should see audio file uploaded

### Test Captions:
1. After voice-over succeeds
2. Click "Generate Captions"
3. Check videos table → captions_data column
4. Should see JSON with timing data

### Test Video Rendering:
1. Start Python backend: `python video_renderer.py`
2. After captions succeed
3. Click "Render Final Video"
4. Backend will detect and process
5. Check Storage for final MP4

## Troubleshooting

### "Failed to generate voice-over"
- Check ElevenLabs API key is correct
- Verify voice ID is valid
- Check API quota/credits

### "Connection Failed" to Supabase
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check network connectivity

### Python backend errors
- Ensure FFmpeg and ImageMagick installed
- Check Python dependencies installed
- Verify Supabase service role key

### Videos not rendering
- Confirm storage bucket `videos` exists and is public
- Check Python backend is running
- Look for errors in backend logs

## Additional API Keys (Optional)

### Whisper API (for backup caption sync)
Not currently implemented but can be added for more accurate caption timing based on actual audio analysis.

## Security Notes

⚠️ **NEVER commit API keys to Git**
⚠️ **Use environment variables in production**
⚠️ **Keep service role key secret**

For production deployment:
- Use environment variables
- Store keys in secure vault (AWS Secrets Manager, etc.)
- Rotate keys regularly
- Set up API rate limiting

## Next Steps

1. ✅ Frontend is ready
2. ⚠️ Add your ElevenLabs API key
3. ⚠️ Create Supabase storage bucket
4. ⚠️ Configure Python backend
5. ⚠️ Test the complete pipeline
6. 🚀 Deploy and automate!
