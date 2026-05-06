# Audio Lyrics Matcher - Model Service

This folder contains the Python-based lyrics extraction and matching service using OpenAI's Whisper model.

## Features

- **Audio Transcription**: Extract lyrics/text from audio files using Whisper
- **Lyrics Matching**: Match extracted lyrics against a database using fuzzy matching
- **Multi-format Support**: Supports MP3, WAV, M4A, FLAC, OGG, WebM, MP4
- **REST API**: Flask-based API for easy integration
- **Configurable**: Tunable parameters via `config.py`

## Setup

### 1. Install Dependencies

```bash
cd model
pip install -r requirements.txt
```

### 2. Generate Lyrics Database

First, generate the lyrics database from your audio files:

```bash
python gen_db.py
```

This will:
- Scan the data folder for audio files
- Transcribe each file using Whisper
- Generate `lyrics_db.json` with all lyrics

### 3. Start the API Server

```bash
python api.py
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Health Check

```http
GET /health
```

Returns server status and database info.

**Response:**
```json
{
  "status": "healthy",
  "service": "Audio Lyrics Matcher",
  "database_loaded": true,
  "songs_in_database": 42
}
```

### Transcribe Audio

```http
POST /api/transcribe
Content-Type: multipart/form-data

audio: <audio_file>
```

Transcribe audio to text without matching.

**Response:**
```json
{
  "success": true,
  "text": "The extracted lyrics from the audio..."
}
```

### Match Audio

```http
POST /api/match
Content-Type: multipart/form-data

audio: <audio_file>
```

Transcribe audio and match against database.

**Response:**
```json
{
  "success": true,
  "best_match": "Song Title",
  "confidence": 92.5,
  "extracted_text": "The extracted lyrics from the audio...",
  "top_matches": [
    {"song": "Song Title", "score": 92.5},
    {"song": "Another Song", "score": 78.3}
  ]
}
```

### Database Info

```http
GET /api/database/info
```

Get information about the loaded lyrics database.

**Response:**
```json
{
  "success": true,
  "total_songs": 42,
  "songs": ["Song1", "Song2", ...]
}
```

## Configuration

Edit `config.py` to customize:

- **WHISPER_MODEL_SIZE**: Model size ("tiny", "base", "small", "medium", "large")
- **MATCH_THRESHOLD**: Minimum confidence score (0-100)
- **UPLOAD_FOLDER**: Where to temporarily store uploaded files
- **LYRICS_DB_PATH**: Path to the lyrics database JSON file

## Files

- **gen_db.py**: Generate lyrics database from audio files
- **matcher.py**: Core matching logic (transcription + fuzzy matching)
- **api.py**: Flask REST API
- **config.py**: Configuration settings
- **database.py**: Database utilities
- **requirements.txt**: Python dependencies

## Workflow

### For Hackathon (Quick Start)

```bash
# 1. Generate database (one-time)
python gen_db.py

# 2. Start API server
python api.py

# 3. Upload audio to match
curl -X POST -F "audio=@song.mp3" http://localhost:5000/api/match
```

### Integration with Backend

The backend can call the model service via HTTP:

1. Start the API server on port 5000
2. Backend makes POST request to `/api/match` with audio file
3. Receive matched song with confidence score
4. Display results to user

## Performance

- **Whisper Model**: 
  - "tiny": ~1-2 seconds per minute of audio (fast, lower accuracy)
  - "base": ~3-5 seconds per minute of audio (good balance) ⭐ Recommended
  - "large": ~20+ seconds per minute of audio (best accuracy)

- **Fuzzy Matching**: <100ms for typical database

- **Memory**: ~2GB for "base" model, ~7GB for "large" model

## Troubleshooting

### Database is empty after running gen_db.py

- Check that audio files exist in the `data/` folder
- Ensure files have supported extensions (.mp3, .wav, etc.)
- Check console output for transcription errors

### Confidence score is low

- Audio quality may be poor
- Database may not contain similar songs
- Try lower MATCH_THRESHOLD in config.py

### Out of memory

- Use smaller Whisper model ("tiny" or "base")
- Process audio in batches
- Increase available RAM

## Environment Variables

```bash
# Optional: Override defaults
export WHISPER_MODEL="base"
export MATCH_THRESHOLD="50"
```

## Next Steps

1. ✅ Generate lyrics database: `python gen_db.py`
2. ✅ Start API server: `python api.py`
3. ✅ Test with sample audio
4. 🔄 Integrate with backend via HTTP calls
5. 📊 Monitor performance and accuracy
