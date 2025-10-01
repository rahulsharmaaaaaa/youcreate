# Python Video Renderer Backend

This backend handles the actual video rendering using MoviePy and FFmpeg.

## Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install System Dependencies

#### On Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg imagemagick
```

#### On macOS:
```bash
brew install ffmpeg imagemagick
```

#### On Windows:
Download and install:
- FFmpeg: https://ffmpeg.org/download.html
- ImageMagick: https://imagemagick.org/script/download.php

### 3. Configure Environment Variables

Edit `video_renderer.py` and update:

```python
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
VOICE_API_KEY = "YOUR_VOICE_API_KEY"
```

Replace these with your actual credentials from:
- Supabase: Dashboard → Settings → API
- Voice API: Your TTS provider (ElevenLabs, etc.)

### 4. Run the Video Renderer

#### Process Queue Once:
```bash
python video_renderer.py
```

#### Run as Continuous Worker (checks every 30 seconds):
```bash
while true; do python video_renderer.py; sleep 30; done
```

#### Or use Cron (every 5 minutes):
```bash
crontab -e
```
Add line:
```
*/5 * * * * cd /path/to/python-backend && python video_renderer.py
```

## Docker Deployment

### Build Docker Image:
```bash
docker build -t video-renderer .
```

### Run Container:
```bash
docker run -d \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_KEY=your_key \
  -e VOICE_API_KEY=your_key \
  --name video-renderer \
  video-renderer
```

## Video Templates

The system includes 6 templates with different color schemes:

1. **Slate Blue** - Professional, academic
2. **Gray Green** - Modern, clean
3. **Purple** - Creative, engaging
4. **Teal** - Tech-focused
5. **Orange** - Energetic, warm
6. **Pink** - Bold, attention-grabbing

Templates rotate automatically for each video.

## How It Works

1. **Queue Detection**: Script checks Supabase for videos with status `captions_generated`
2. **Download Audio**: Fetches the voice-over audio file
3. **Create Background**: Generates template background based on template_id
4. **Add Captions**: Adds animated captions with word-by-word highlighting
5. **Composite**: Combines all layers (background + captions + audio)
6. **Render**: Exports final video as MP4 (1080x1920, 30fps)
7. **Upload**: Uploads to Supabase Storage
8. **Update DB**: Updates video record with final URL and status

## Customization

### Change Video Size:
Edit `video_size = (1080, 1920)` to your preferred resolution
- 16:9 (YouTube): `(1920, 1080)`
- 1:1 (Instagram): `(1080, 1080)`
- 9:16 (TikTok/Reels): `(1080, 1920)`

### Modify Caption Style:
Edit the `create_caption_clip()` function:
- Font size
- Font family
- Colors
- Position
- Animation effects

### Add Template:
Add new entry to `TEMPLATES` dictionary with background color and accent color.

## Troubleshooting

### MoviePy errors:
- Ensure FFmpeg is installed and in PATH
- Check ImageMagick installation

### Memory issues:
- Reduce video resolution
- Process videos one at a time
- Increase system RAM/swap

### Upload failures:
- Check Supabase storage bucket exists (name: `videos`)
- Verify service role key has storage permissions
- Check network connectivity

## Production Deployment

For production, consider:
- **Queue System**: Use Redis/RabbitMQ for better queue management
- **Worker Pool**: Run multiple workers in parallel
- **Monitoring**: Add logging and error alerting
- **Auto-scaling**: Use Kubernetes or AWS ECS
- **Storage**: Use CDN for video delivery
