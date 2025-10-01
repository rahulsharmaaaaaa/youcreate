FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY video_renderer.py .

# Set environment variables (override these at runtime)
ENV SUPABASE_URL=""
ENV SUPABASE_KEY=""
ENV VOICE_API_KEY=""

# Run the worker in loop mode
CMD while true; do python video_renderer.py; sleep 30; done
