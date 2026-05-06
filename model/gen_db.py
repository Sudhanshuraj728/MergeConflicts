import os
import json
import whisper

# Faster model for hackathon
model = whisper.load_model("tiny")

DATASET_FOLDER = "dataset"

database = {}

SUPPORTED_FORMATS = (".mp3", ".wav", ".m4a")

for file in os.listdir(DATASET_FOLDER):

    if file.endswith(SUPPORTED_FORMATS):

        path = os.path.join(DATASET_FOLDER, file)

        print(f"Processing: {file}")

        try:

            result = model.transcribe(path)

            extracted_text = result["text"]

            song_name = os.path.splitext(file)[0]

            database[song_name] = extracted_text

            print(f"Done: {song_name}")

        except Exception as e:

            print(f"Error processing {file}: {e}")

# Save generated subtitles database
with open("lyrics.json", "w", encoding="utf-8") as f:

    json.dump(database, f, indent=4)

print("\\nLyrics database generated successfully.")