# Audio Identification & Source Detection System

## Team Information
Team Name: MergeConflicts  
Year: 2nd  
All-Female Team: No 

---

## Architecture Overview

Describe your approach here. Keep it short and clear.

- The system preprocesses all dataset audio files using the Whisper speech-to-text model and extracts subtitle/lyrics text from each song. These extracted text features are stored in a lightweight JSON database for fast retrieval and efficient storage.

- For matching, uploaded query audio is transcribed in real time and compared against the stored subtitle database using RapidFuzz partial similarity matching. This allows the system to identify songs even from short or partially noisy audio snippets.

- The architecture is designed with an offline preprocessing pipeline and a lightweight runtime pipeline. Since all dataset songs are processed beforehand, the system only performs transcription and fuzzy matching during queries, enabling scalability to thousands of songs with low computational overhead.

- Low latency is achieved through precomputed subtitle storage, optimized fuzzy matching, and use of the lightweight Whisper Tiny model. Accuracy is improved by semantic lyric matching, which remains effective even under background noise, partial clips, or moderate audio distortion.
