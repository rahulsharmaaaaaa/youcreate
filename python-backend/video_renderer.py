"""
AI Video Renderer for Educational Content
Uses MoviePy, FFmpeg, and Supabase for automated video generation

Requirements:
pip install moviepy pillow supabase requests google-generativeai

External Tools Needed:
- FFmpeg (for video processing)
- ImageMagick (for text rendering)
"""

import os
import json
import requests
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client
from moviepy.editor import (
    VideoClip, AudioFileClip, TextClip, CompositeVideoClip,
    ColorClip, concatenate_videoclips
)
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Configuration - REPLACE THESE WITH YOUR ACTUAL VALUES
SUPABASE_URL = "YOUR_SUPABASE_URL"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"
VOICE_API_KEY = "YOUR_VOICE_API_KEY"  # ElevenLabs or similar TTS API

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Template configurations
TEMPLATES = {
    1: {"bg_color": (15, 23, 42), "accent": (59, 130, 246)},  # Slate blue
    2: {"bg_color": (17, 24, 39), "accent": (16, 185, 129)},  # Gray green
    3: {"bg_color": (20, 14, 28), "accent": (168, 85, 247)},  # Purple
    4: {"bg_color": (7, 29, 35), "accent": (34, 211, 238)},   # Teal
    5: {"bg_color": (30, 17, 9), "accent": (251, 146, 60)},   # Orange
    6: {"bg_color": (25, 20, 31), "accent": (236, 72, 153)},  # Pink
}

def download_audio(audio_url: str, output_path: str) -> str:
    """Download audio file from URL"""
    response = requests.get(audio_url)
    response.raise_for_status()

    with open(output_path, 'wb') as f:
        f.write(response.content)

    return output_path

def create_caption_clip(text: str, start: float, end: float,
                       video_size: tuple, accent_color: tuple,
                       highlight_word_index: int = -1) -> TextClip:
    """Create a caption clip with optional word highlighting"""

    duration = end - start

    # Split text into words for highlighting effect
    words = text.split()

    # Create highlighted version if word index is provided
    if 0 <= highlight_word_index < len(words):
        # Highlight current word
        font_size = 60
        font = 'Arial-Bold'
        color = 'white'
        bg_color = accent_color

        txt_clip = TextClip(
            words[highlight_word_index],
            fontsize=font_size,
            color=color,
            font=font,
            method='caption',
            size=(video_size[0] - 100, None),
            bg_color=f'rgb({bg_color[0]},{bg_color[1]},{bg_color[2]})'
        )
    else:
        # Regular caption
        txt_clip = TextClip(
            text,
            fontsize=50,
            color='white',
            font='Arial-Bold',
            method='caption',
            size=(video_size[0] - 100, None)
        )

    txt_clip = txt_clip.set_position(('center', 'bottom')).set_duration(duration)
    return txt_clip.set_start(start)

def create_background_video(duration: float, template_id: int,
                           video_size: tuple = (1080, 1920)) -> ColorClip:
    """Create animated background for the template"""

    template = TEMPLATES.get(template_id, TEMPLATES[1])
    bg_color = template["bg_color"]

    # Create solid color background
    bg_clip = ColorClip(size=video_size, color=bg_color, duration=duration)

    return bg_clip

def create_question_card(question_text: str, template_id: int,
                        video_size: tuple = (1080, 1920)) -> np.ndarray:
    """Create a visual card for the question"""

    template = TEMPLATES.get(template_id, TEMPLATES[1])

    # Create image with PIL
    img = Image.new('RGB', video_size, color=template["bg_color"])
    draw = ImageDraw.Draw(img)

    # Add accent border
    border_width = 10
    draw.rectangle(
        [(border_width, border_width),
         (video_size[0] - border_width, video_size[1] - border_width)],
        outline=template["accent"],
        width=border_width
    )

    # Add "Question" header
    try:
        font_large = ImageFont.truetype("arial.ttf", 80)
        font_medium = ImageFont.truetype("arial.ttf", 50)
    except:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()

    # Draw header
    header_y = 100
    draw.text((video_size[0]//2, header_y), "Question",
             fill=template["accent"], font=font_large, anchor="mm")

    # Draw question text (wrapped)
    max_width = video_size[0] - 100
    y_offset = 300

    # Simple text wrapping
    words = question_text.split()
    lines = []
    current_line = []

    for word in words:
        current_line.append(word)
        test_line = ' '.join(current_line)
        bbox = draw.textbbox((0, 0), test_line, font=font_medium)
        if bbox[2] - bbox[0] > max_width:
            if len(current_line) > 1:
                current_line.pop()
                lines.append(' '.join(current_line))
                current_line = [word]
            else:
                lines.append(test_line)
                current_line = []

    if current_line:
        lines.append(' '.join(current_line))

    for line in lines:
        draw.text((video_size[0]//2, y_offset), line,
                 fill='white', font=font_medium, anchor="mm")
        y_offset += 70

    return np.array(img)

def render_video(video_id: str) -> str:
    """
    Main function to render video
    Returns the URL of the uploaded video
    """

    print(f"Starting video rendering for {video_id}")

    # Fetch video data from Supabase
    response = supabase.table('videos').select('*').eq('id', video_id).execute()

    if not response.data or len(response.data) == 0:
        raise ValueError(f"Video record {video_id} not found")

    video_data = response.data[0]

    audio_url = video_data.get('audio_url')
    captions_data = video_data.get('captions_data', [])
    template_id = video_data.get('template_id', 1)
    script = video_data.get('script', '')

    if not audio_url:
        raise ValueError("No audio URL found for video")

    # Create temp directory
    temp_dir = Path(f'/tmp/video_{video_id}')
    temp_dir.mkdir(exist_ok=True)

    # Download audio
    audio_path = temp_dir / 'audio.mp3'
    print(f"Downloading audio from {audio_url}")
    download_audio(audio_url, str(audio_path))

    # Load audio to get duration
    audio = AudioFileClip(str(audio_path))
    duration = audio.duration

    print(f"Audio duration: {duration}s")

    # Create background video
    video_size = (1080, 1920)  # 9:16 for social media
    background = create_background_video(duration, template_id, video_size)

    # Create caption clips with highlighting
    caption_clips = []

    for caption in captions_data:
        start = float(caption['start'])
        end = float(caption['end'])
        text = caption['text']

        # Create caption with fade in/out
        clip = create_caption_clip(text, start, end, video_size,
                                   TEMPLATES[template_id]["accent"])
        caption_clips.append(clip)

    # Composite everything
    print("Compositing video layers...")
    final_video = CompositeVideoClip([background] + caption_clips)
    final_video = final_video.set_audio(audio)

    # Render final video
    output_path = temp_dir / f'video_{video_id}.mp4'
    print(f"Rendering video to {output_path}")

    final_video.write_videofile(
        str(output_path),
        fps=30,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile=str(temp_dir / 'temp_audio.m4a'),
        remove_temp=True,
        threads=4
    )

    print("Video rendering complete!")

    # Upload to Supabase Storage
    print("Uploading to Supabase...")

    with open(output_path, 'rb') as f:
        video_bytes = f.read()

    storage_path = f'videos/video_{video_id}_template_{template_id}.mp4'

    supabase.storage.from_('videos').upload(
        storage_path,
        video_bytes,
        file_options={"content-type": "video/mp4", "upsert": "true"}
    )

    # Get public URL
    video_url = supabase.storage.from_('videos').get_public_url(storage_path)

    # Update database
    supabase.table('videos').update({
        'video_url': video_url,
        'status': 'video_rendered',
        'updated_at': datetime.utcnow().isoformat()
    }).eq('id', video_id).execute()

    print(f"Video uploaded successfully: {video_url}")

    # Cleanup
    import shutil
    shutil.rmtree(temp_dir)

    return video_url

def process_video_queue():
    """
    Worker function to process videos in queue
    Run this in a cron job or as a continuous worker
    """

    print("Checking for videos to render...")

    # Find videos that need rendering
    response = supabase.table('videos').select('*').eq('status', 'captions_generated').execute()

    for video in response.data:
        try:
            print(f"Processing video {video['id']}")
            render_video(video['id'])
        except Exception as e:
            print(f"Error rendering video {video['id']}: {str(e)}")
            # Update status to error
            supabase.table('videos').update({
                'status': 'error',
                'updated_at': datetime.utcnow().isoformat()
            }).eq('id', video['id']).execute()

if __name__ == "__main__":
    # Example: Process queue
    # In production, run this as a cron job or systemd service
    process_video_queue()
