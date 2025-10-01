# Current Status & Action Required

## 🔴 Error You're Seeing

```
invalid input syntax for type integer: "559db346-868a-48f1-80f1-e356e9959c22"
```

## 🎯 Root Cause

Your `new_questions.id` column is **UUID** type, but `videos.question_id` expects **INTEGER**. They must match!

## ✅ SOLUTION (2 Steps)

### Step 1: Fix Database Types

**Go to Supabase Dashboard → SQL Editor**

Run this file: `DETECT_AND_FIX_TYPES.sql`

This will:
- Detect your actual column types automatically
- Fix the type mismatch (UUID vs INTEGER)
- Add all missing columns
- Verify everything is correct

### Step 2: Create Storage Bucket

**Go to Supabase Dashboard → Storage**

1. Click "New Bucket"
2. Name: `videos`
3. Make it Public ✓
4. Click Create

## 📋 What's Already Done

✅ TypeScript types updated to support both UUID and INTEGER
✅ Environment variables configured
✅ Missing secrets issue resolved (PYTHON_BACKEND_URL is optional)
✅ Frontend code ready
✅ Edge functions ready
✅ Build successful

## 🔧 What Was Fixed in Code

### 1. TypeScript Types (`src/types/database.ts`)
```typescript
// Before:
id: number

// After:
id: number | string  // Supports both INTEGER and UUID
```

### 2. Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_PYTHON_BACKEND_URL=  # Optional - can be empty
```

### 3. SQL Scripts Created
- `DETECT_AND_FIX_TYPES.sql` ⭐ Run this one!
- `FIX_DATABASE_TYPES.sql` (manual alternative)
- `RUN_THIS_SQL_FIRST.sql` (original migration)

## 🚦 After Running SQL

Your pipeline will work:
1. ✅ Generate Script (Gemini AI)
2. ✅ Save to Database (no more type error!)
3. ✅ Generate Voice Over (ElevenLabs)
4. ✅ Generate Captions (Edge function)
5. ✅ Render Video (mock URL until Python backend deployed)

## 📚 Documentation Files

- `API_KEYS_SETUP.md` - All about your API keys and secrets
- `DETECT_AND_FIX_TYPES.sql` - **RUN THIS FIRST**
- `COMPLETE_SETUP_GUIDE.md` - Full system documentation
- `SUPABASE_STORAGE_SETUP.md` - Storage bucket details
- `QUICK_START.md` - Already existed, has other useful info

## ⚠️ About Missing Secrets Warning

The warning about `PYTHON_BACKEND_URL` is **SAFE TO IGNORE**.

Why?
- It's only for the Python video renderer
- Not needed for script generation, voice-over, or captions
- Video rendering returns a mock URL until you deploy Python backend
- You can deploy it later (optional)

## 🎬 Complete Workflow

```
Select Exam → Select Course → Pick Question
        ↓
Generate Script (Gemini AI)
        ↓
Save to Database (marks question as used)
        ↓
Generate Voice Over (ElevenLabs → Supabase Storage)
        ↓
Generate Captions (word-level timing)
        ↓
Render Video (Python backend or mock URL)
```

## 🎯 Next Steps

1. **NOW**: Run `DETECT_AND_FIX_TYPES.sql` in Supabase SQL Editor
2. **NOW**: Create `videos` storage bucket (public)
3. **TEST**: Try generating a script and saving to database
4. **LATER**: Deploy Python backend for actual video rendering

## 📞 If Still Having Issues

### Check these:
- [ ] Did you run the SQL script?
- [ ] Does the `videos` bucket exist?
- [ ] Is the bucket public?
- [ ] Are there questions in `new_questions` table?
- [ ] Is `used_in_video` column NULL for at least one question?

### Common fixes:
```sql
-- Reset a question to use again
UPDATE new_questions SET used_in_video = null WHERE id = 1;

-- Check column types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('videos', 'new_questions')
  AND column_name IN ('id', 'question_id');
```

## 🎉 You're Almost There!

Just run the SQL script and create the storage bucket. Your video generation system will be fully functional!
