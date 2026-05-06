import whisper

# Load Whisper model only once
model = whisper.load_model("base")


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

    extracted_text = transcribe_audio(audio_path)

    match_result = match_lyrics(extracted_text, database)

    return {
        'extracted_text': extracted_text,
        'best_match': match_result['best_match'],
        'confidence': match_result['confidence'],
        'top_matches': match_result['all_scores']
    }