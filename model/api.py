"""
Flask API for Audio Lyrics Matching
Exposes endpoints for:
- Transcribing audio to text
- Matching audio against lyrics database
- Health checks
"""

from flask import Flask, request, jsonify
import os
import tempfile
from werkzeug.utils import secure_filename
from matcher import process_audio_and_match, transcribe_audio, load_lyrics_database
from config import (
    FLASK_HOST, FLASK_PORT, FLASK_DEBUG,
    ALLOWED_EXTENSIONS, UPLOAD_FOLDER, MATCH_THRESHOLD
)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size


def allowed_file(filename):
    """Check if file has an allowed extension."""
    return '.' in filename and os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    database = load_lyrics_database()
    return jsonify({
        'status': 'healthy',
        'service': 'Audio Lyrics Matcher',
        'database_loaded': len(database) > 0,
        'songs_in_database': len(database)
    }), 200


@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    """
    Transcribe audio file to text using Whisper.
    
    Expected: multipart/form-data with 'audio' file
    Returns: {success, text, error}
    """
    try:
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File format not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Transcribe audio
            text = transcribe_audio(filepath)
            return jsonify({
                'success': True,
                'text': text
            }), 200
        finally:
            # Clean up temporary file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/match', methods=['POST'])
def match():
    """
    Match audio against lyrics database.
    
    Expected: multipart/form-data with 'audio' file
    Returns: {success, best_match, confidence, top_matches, extracted_text}
    """
    try:
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No audio file provided'
            }), 400

        file = request.files['audio']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': f'File format not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            # Process and match
            result = process_audio_and_match(filepath)
            
            if 'error' in result:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400

            # Check if confidence meets threshold
            if result['confidence'] < MATCH_THRESHOLD:
                return jsonify({
                    'success': True,
                    'best_match': None,
                    'confidence': result['confidence'],
                    'top_matches': result['top_matches'],
                    'extracted_text': result['extracted_text'],
                    'message': f'No strong match found (threshold: {MATCH_THRESHOLD}%)'
                }), 200

            return jsonify({
                'success': True,
                'best_match': result['best_match'],
                'confidence': result['confidence'],
                'top_matches': result['top_matches'],
                'extracted_text': result['extracted_text']
            }), 200

        finally:
            # Clean up temporary file
            if os.path.exists(filepath):
                os.remove(filepath)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/database/info', methods=['GET'])
def database_info():
    """Get information about the lyrics database."""
    try:
        database = load_lyrics_database()
        return jsonify({
            'success': True,
            'total_songs': len(database),
            'songs': list(database.keys()) if len(database) <= 100 else list(database.keys())[:100] + [f"... and {len(database) - 100} more"]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large errors."""
    return jsonify({
        'success': False,
        'error': 'File too large. Maximum size: 100MB'
    }), 413


@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
