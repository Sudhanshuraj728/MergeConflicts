from flask import Flask, render_template, request
import os
from matcher import process_audio_and_match

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return {
            'error': 'No audio file uploaded'
        }

    file = request.files['audio']

    if file.filename == '':
        return {
            'error': 'Empty filename'
        }

    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    result = process_audio_and_match(filepath)

    return result


if __name__ == '__main__':
    app.run(debug=True)