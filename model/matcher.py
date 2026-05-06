import whisper
import json
import os
from rapidfuzz import fuzz
from config import WHISPER_MODEL_SIZE, LYRICS_DB_PATH, MATCH_THRESHOLD

# Load Whisper model only once
model = whisper.load_model(WHISPER_MODEL_SIZE)


def load_lyrics_database():
    """
    Load the lyrics database from JSON file.
    Returns empty dict if file doesn't exist.
    """
    if os.path.exists(LYRICS_DB_PATH):
        try:
            with open(LYRICS_DB_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading lyrics database: {e}")
            return {}
    return {}


def transcribe_audio(audio_path):
    """
    Converts uploaded audio into text using Whisper.
    """
    result = model.transcribe(audio_path)
    extracted_text = result["text"]
    return extracted_text


def match_lyrics(query_text, database):
    """
    Matches extracted lyrics with database lyrics.
    """
    best_song = None
    best_score = 0
    all_scores = []

    for song, lyrics in database.items():
        score = fuzz.partial_ratio(
            query_text.lower(),
            lyrics.lower()
        )

        all_scores.append({
            'song': song,
            'score': round(score, 2)
        })

        if score > best_score:
            best_score = score
            best_song = song

    all_scores = sorted(
        all_scores,
        key=lambda x: x['score'],
        reverse=True
    )

    confidence = min(round(best_score, 2), 100)

    return {
        'best_match': best_song,
        'confidence': confidence,
        'all_scores': all_scores[:5]
    }


def process_audio_and_match(audio_path):
    """
    Full pipeline:
    audio -> text -> lyrics matching
    """
    database = load_lyrics_database()

    if not database:
        return {
            'extracted_text': None,
            'best_match': None,
            'confidence': 0,
            'top_matches': [],
            'error': 'Lyrics database is empty. Please generate it first.'
        }

    extracted_text = transcribe_audio(audio_path)

    match_result = match_lyrics(extracted_text, database)

    return {
        'extracted_text': extracted_text,
        'best_match': match_result['best_match'],
        'confidence': match_result['confidence'],
        'top_matches': match_result['all_scores']
    }