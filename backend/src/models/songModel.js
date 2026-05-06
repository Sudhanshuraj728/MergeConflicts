const { v4: uuidv4 } = require('uuid');
const { readSongDatabase, writeSongDatabase } = require('../utils/fileStore');

/**
 * Song Model
 * 
 * Stores song metadata and features for matching
 * Database structure:
 * {
 *   id: string (UUID)
 *   title: string
 *   description: string
 *   filename: string
 *   metadata: { duration, sampleRate, channels, codec }
 *   waveformStats: { rms, peak, zcr, centroid, spread, entropy, crest, flatness }
 *   spectralFingerprint: [16 floats]
 *   anchorPoints: [{ index, value }]
 *   audioSignature: { combined, energy }
 *   durationScale: float
 *   createdAt: ISO timestamp
 * }
 * 
 * Total per song: ~2-3 KB (optimized)
 */

const getAllSongs = async () => {
  return await readSongDatabase();
};

const getSongById = async (id) => {
  const songs = await readSongDatabase();
  return songs.find((song) => song.id === id);
};

const createSong = async ({ title, description, filename, features, metadata }) => {
  const songs = await readSongDatabase();

  const newSong = {
    id: uuidv4(),
    title: title || 'Unknown Song',
    description: description || '',
    filename,

    // Optimized features (from audioProcessingPipeline)
    metadata: features.metadata,
    waveformStats: features.waveformStats,
    spectralFingerprint: features.spectralFingerprint,
    anchorPoints: features.anchorPoints,
    audioSignature: features.audioSignature,
    durationScale: features.durationScale,

    // Metadata
    createdAt: new Date().toISOString()
  };

  songs.push(newSong);
  await writeSongDatabase(songs);

  return newSong;
};

module.exports = { getAllSongs, getSongById, createSong };
