# Supabase Storage Setup

## Required Storage Bucket

Your video pipeline requires a storage bucket for audio files and rendered videos.

### Create the 'videos' Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure as follows:

```
Bucket Name: videos
Public: ✓ Yes (checked)
File Size Limit: 100 MB (or higher for larger videos)
Allowed MIME types: Leave empty (allows all)
```

5. Click **Create Bucket**

### Bucket Structure

The system will automatically organize files as:

```
videos/
  ├── audio_<video-id>.mp3           (Voice-over audio files)
  └── video_<video-id>_template_<n>.mp4  (Final rendered videos)
```

## Why Public Access?

The bucket must be public so that:
- Audio files can be accessed by the Python backend for video rendering
- Final video URLs can be shared directly
- ElevenLabs-generated audio can be uploaded and retrieved

## Security Note

Even though the bucket is public, files are only accessible if you know the exact URL. The UUIDs in video IDs make URLs unpredictable.

## Verify Storage Access

After creating the bucket, verify it works:

1. Run this query in Supabase SQL Editor:

```sql
SELECT * FROM storage.buckets WHERE name = 'videos';
```

You should see one row with name='videos' and public=true

2. Test upload (optional):

You can test by uploading a file through the Supabase dashboard:
- Go to Storage → videos bucket
- Click Upload File
- Upload any small test file
- Verify you can access it via the public URL

## Storage Policies

If you need to add storage policies for write access:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow public uploads (if needed for your use case)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'videos');

-- Allow public read (should already be enabled by making bucket public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');
```

Note: These policies are usually not needed if the bucket is set to public during creation.

## Storage Quota

Check your Supabase plan for storage limits:
- **Free Plan**: 1 GB storage
- **Pro Plan**: 100 GB storage
- Videos can be large (10-50 MB each)

Monitor your storage usage in the Supabase Dashboard under **Settings → Usage**

## Cleanup (Optional)

If you want to automatically clean up old files, you can create a Supabase edge function to delete videos older than X days.

Example cleanup query:
```sql
-- Find videos older than 30 days
SELECT * FROM videos
WHERE created_at < NOW() - INTERVAL '30 days'
AND video_url IS NOT NULL;
```

Then delete corresponding storage files via the Supabase client.
