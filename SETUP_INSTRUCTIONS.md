# Setup Instructions - You Create AI Video Maker

Follow these steps in order to get your application running.

---

## Step 1: Run Database Migration in Supabase ⚠️ CRITICAL

You MUST run this SQL in your Supabase SQL Editor before using the application.

### How to Run:
1. Go to https://supabase.com/dashboard
2. Select your project: `hljcqhqzqnedmwhwddcu`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run** or press `Ctrl+Enter`

### SQL to Run:

```sql
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
```

### What This Does:
- Adds `question_id` column to `videos` table (links videos to questions)
- Adds `used_in_video` column to `new_questions` table (tracks which questions have been used)

---

## Step 2: Create Supabase Storage Bucket

You need a storage bucket to store audio files and videos.

### How to Create:
1. In Supabase Dashboard, go to **Storage** in left sidebar
2. Click **New bucket**
3. Bucket name: `videos`
4. **Make it PUBLIC** (toggle the public option)
5. Click **Create bucket**

### Why This is Needed:
- Stores generated audio files (voice-overs)
- Stores final rendered videos
- Must be public so videos can be accessed via URL

---

## Step 3: Deploy Supabase Edge Functions

Your Edge Functions need to be deployed to work with the application.

### Option A: Using Supabase CLI (Recommended)

If you have Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref hljcqhqzqnedmwhwddcu

# Deploy the edge functions
supabase functions deploy generate-captions
supabase functions deploy render-video
```

### Option B: Manual Deployment via Dashboard

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name: `generate-captions`
4. Copy contents from `supabase/functions/generate-captions/index.ts`
5. Click **Deploy**
6. Repeat for `render-video` function

---

## Step 4: Verify Everything is Working

### Check Database Columns:
Run this SQL to verify columns were added:

```sql
-- Check videos table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'videos';

-- Check new_questions table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'new_questions';
```

You should see:
- `videos` table has `question_id` column
- `new_questions` table has `used_in_video` column

### Check Storage Bucket:
1. Go to **Storage** in Supabase Dashboard
2. You should see `videos` bucket
3. Click on it - should be empty initially
4. Check that it's marked as **Public**

### Check Edge Functions:
1. Go to **Edge Functions** in Supabase Dashboard
2. You should see:
   - `generate-captions` (deployed)
   - `render-video` (deployed)
3. Both should show "Active" status

---

## Step 5: Test Your Application

Now you can test the application!

### What's Working Now:
✅ **Step 1: Generate Script**
- Uses Gemini AI to create educational video script
- Automatically marks question as "used"
- Saves script to Supabase `videos` table

✅ **Step 2: Generate Voice Over**
- Uses ElevenLabs TTS API (your API key is configured)
- Voice ID: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`
- Uploads audio to Supabase Storage
- Saves audio URL to database

✅ **Step 3: Generate Captions**
- Calls Supabase Edge Function
- Creates timed captions (word-level timing)
- Saves caption data as JSON

⚠️ **Step 4: Render Video**
- Currently returns mock response
- Needs Python backend to actually render videos
- See `python-backend/` directory for implementation

### How to Test:
1. Open the application
2. Select an **Exam** from the left dropdown
3. Select a **Course** from the right dropdown
4. You'll see available questions count
5. Click **"1. Generate Script"** button
6. Wait for script generation (5-10 seconds)
7. Click **"2. Generate Voice Over"** button
8. Wait for audio generation (10-30 seconds depending on length)
9. Click **"3. Generate Captions"** button
10. Instant caption generation
11. Click **"4. Render Final Video"** (will return placeholder for now)

---

## Common Issues & Solutions

### Issue: "Could not find the 'question_id' column"
**Solution**: You didn't run the database migration. Go back to Step 1.

### Issue: "Failed to generate voice-over"
**Possible Causes**:
- ElevenLabs API key is invalid
- Voice ID doesn't exist in your account
- No credits left in ElevenLabs account
- Network/CORS issue

**Solution**:
- Verify API key is correct
- Check ElevenLabs dashboard for credits
- Ensure voice ID exists

### Issue: "Storage bucket not found"
**Solution**: Create the `videos` storage bucket (Step 2)

### Issue: "Failed to generate captions"
**Solution**: Edge Functions not deployed. Complete Step 3.

### Issue: Connection to Supabase fails
**Possible Causes**:
- Incorrect credentials in `.env` file
- Supabase project paused/inactive
- Network connectivity issue

**Solution**:
- Verify `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase dashboard - project should be active

---

## Configuration Summary

### API Keys Configured:
✅ Gemini API: `AIzaSyDgShKEEeX9viEQ90JHAUBfwQqlu0c9rBw`
✅ ElevenLabs API: `sk_78d719766a3026b96c79d89fefeac203b978509b03404756`
✅ ElevenLabs Voice ID: `ap2_01771851-fe5d-4e13-a843-a49b28e72ef9`

### Supabase Configuration:
✅ URL: `https://hljcqhqzqnedmwhwddcu.supabase.co`
✅ Anon Key: Configured in `.env`

### Database Tables Used:
- `exams` - List of exams
- `courses` - Courses per exam
- `subjects` - Subjects per course
- `units` - Units per subject
- `chapters` - Chapters per unit
- `topics` - Topics per chapter
- `new_questions` - Questions per topic (with `used_in_video` tracking)
- `videos` - Generated video records

---

## Next Steps After Setup

Once everything is working:

1. **Test the full pipeline** - Generate a few test videos
2. **Verify question tracking** - Check that `used_in_video` is set to 'yes'
3. **Check storage** - Verify audio files are being uploaded
4. **Review scripts** - Make sure Gemini generates good quality scripts
5. **Build Python renderer** - Complete video rendering functionality

For Python backend setup, see: `python-backend/README.md`

---

## Need Help?

If you encounter any issues:
1. Check browser console for error messages
2. Check Supabase logs in Dashboard → Logs
3. Verify all steps above were completed
4. Check that your Supabase project is active and not paused

Remember: The application uses ONLY your Supabase database - no local database needed!
