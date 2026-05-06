const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const wav = require('wav-decoder');
const { fft, util } = require('fft-js');
const { v4: uuidv4 } = require('uuid');

ffmpeg.setFfmpegPath(ffmpegStatic);

const convertAudioToWav = async (inputPath) => {
  const tempFile = path.join(os.tmpdir(), `audio-convert-${uuidv4()}.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-ac 1', '-ar 8000', '-f wav'])
      .save(tempFile)
      .on('end', () => resolve(tempFile))
      .on('error', (err) => reject(err));
  });
};

const decodeWavFile = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  const audioData = await wav.decode(buffer);
  return audioData.channelData[0] || [];
};

const computeFeatureVector = (samples) => {
  const frameSize = 2048;
  const hopSize = 1024;
  const bands = 10;
  const featureVectors = [];

  if (samples.length < frameSize) {
    const padded = new Float32Array(frameSize);
    padded.set(samples);
    samples = padded;
  }

  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    const frame = samples.slice(start, start + frameSize);
    const windowed = frame.map((value, index) => {
      const multiplier = 0.54 - 0.46 * Math.cos((2 * Math.PI * index) / (frameSize - 1));
      return value * multiplier;
    });

    const phasors = fft(windowed);
    const magnitudes = util.fftMag(phasors).slice(0, frameSize / 2);
    const bandSize = Math.floor(magnitudes.length / bands);
    const bandEnergies = new Array(bands).fill(0);

    let totalEnergy = 0;
    for (let band = 0; band < bands; band++) {
      const startIndex = band * bandSize;
      const endIndex = band === bands - 1 ? magnitudes.length : startIndex + bandSize;
      for (let k = startIndex; k < endIndex; k += 1) {
        bandEnergies[band] += magnitudes[k];
      }
      totalEnergy += bandEnergies[band];
    }

    if (totalEnergy > 0) {
      featureVectors.push(bandEnergies.map((value) => value / totalEnergy));
    }
  }

  if (featureVectors.length === 0) {
    return Array(bands).fill(0);
  }

  const averaged = Array(bands).fill(0);
  featureVectors.forEach((vector) => {
    vector.forEach((value, index) => {
      averaged[index] += value;
    });
  });

  return averaged.map((value) => value / featureVectors.length);
};

const extractFeatures = async (filePath) => {
  const tempWav = await convertAudioToWav(filePath);
  try {
    const samples = await decodeWavFile(tempWav);
    const features = computeFeatureVector(samples);
    return { features, duration: samples.length / 8000 };
  } finally {
    fs.promises.unlink(tempWav).catch(() => {});
  }
};

const cosineSimilarity = (vectorA, vectorB) => {
  if (!vectorA || !vectorB || vectorA.length !== vectorB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vectorA.length; i += 1) {
    dot += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const findBestMatch = (queryFeatures, songs) => {
  let best = null;
  let bestScore = 0;

  songs.forEach((song) => {
    const score = cosineSimilarity(queryFeatures, song.features);
    if (score > bestScore) {
      bestScore = score;
      best = song;
    }
  });

  return {
    match: best,
    similarity: bestScore
  };
};

module.exports = { extractFeatures, findBestMatch };
