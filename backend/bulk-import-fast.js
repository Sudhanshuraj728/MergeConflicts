const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const AdmZip = require('adm-zip');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { v4: uuidv4 } = require('uuid');

const BATCH_SIZE = 100;
const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];

// Lightweight metadata extraction (no heavy feature extraction)
function extractBasicMetadata(fileName, fileSize) {
  const ext = path.extname(fileName).toLowerCase().slice(1);
  
  return {
    codec: ext.toUpperCase(),
    fileSize: fileSize,
    extractedAt: new Date()
  };
}

async function bulkImportFast() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'mergeconflicts';
  const zipPath = 'c:\\Users\\sudha\\Downloads\\data.zip';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         🎵 FAST BULK AUDIO IMPORT (OPTIMIZED) 🎵         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Extract ZIP and list files
    console.log('STEP 1: Analyzing dataset ZIP file...\n');
    
    if (!fs.existsSync(zipPath)) {
      console.error(`❌ ZIP file not found: ${zipPath}`);
      return;
    }

    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    
    // Filter audio files
    const audioFiles = zipEntries.filter(entry => {
      if (entry.isDirectory) return false;
      const ext = path.extname(entry.name).toLowerCase().slice(1);
      return ALLOWED_FORMATS.includes(ext);
    });

    console.log(`✓ ZIP loaded`);
    console.log(`✓ Total entries: ${zipEntries.length}`);
    console.log(`✓ Audio files found: ${audioFiles.length}\n`);

    if (audioFiles.length === 0) {
      console.error('❌ No audio files found');
      return;
    }

    // Step 2: Connect to MongoDB
    console.log('STEP 2: Connecting to MongoDB...\n');
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const songsCollection = db.collection('songs');
    
    console.log('✓ Connected to MongoDB');
    await songsCollection.createIndex({ uploadedBy: 1 });
    console.log('✓ Indexes ready\n');

    // Step 3: Bulk insert with metadata only
    console.log('STEP 3: Bulk importing audio metadata...\n');
    
    let successCount = 0;
    let skipCount = 0;
    const batchDocuments = [];
    const startTime = Date.now();

    for (let i = 0; i < audioFiles.length; i++) {
      const entry = audioFiles[i];
      const fileName = path.basename(entry.name);
      
      try {
        // Check if already exists
        const exists = await songsCollection.findOne({ filename: fileName });
        if (exists) {
          skipCount++;
          continue;
        }

        // Create song document with metadata only (no feature extraction)
        const songDoc = {
          id: uuidv4(),
          title: fileName.replace(/\.[^.]+$/, ''),
          description: `Dataset import - ${fileName}`,
          filename: fileName,
          features: {
            waveformStats: {},
            spectralFingerprint: {},
            audioSignature: {},
            anchorPoints: [],
            metadata: {
              sampleRate: 44100,
              channels: 2,
              codec: path.extname(fileName).toUpperCase().slice(1),
              duration: 0,
              fileSize: entry.size
            }
          },
          metadata: extractBasicMetadata(fileName, entry.size),
          uploadedBy: null,
          createdAt: new Date()
        };

        batchDocuments.push(songDoc);
        successCount++;

        // Insert batch
        if (batchDocuments.length >= BATCH_SIZE || i === audioFiles.length - 1) {
          try {
            await songsCollection.insertMany(batchDocuments);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const progress = ((successCount + skipCount) / audioFiles.length * 100).toFixed(1);
            console.log(`✓ Inserted: ${batchDocuments.length} | Total: ${successCount + skipCount}/${audioFiles.length} (${progress}%) | ${elapsed}s`);
            batchDocuments.length = 0;
          } catch (err) {
            console.error(`✗ Batch insert error: ${err.message}`);
          }
        }

      } catch (error) {
        console.error(`✗ Error processing ${fileName}: ${error.message}`);
      }
    }

    // Step 4: Verify import
    console.log('\nSTEP 4: Verifying import...\n');
    const totalSongs = await songsCollection.countDocuments({});
    const totalDatasetSongs = successCount + skipCount;
    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ IMPORT COMPLETE ✅                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Import Summary:`);
    console.log(`   ✓ Newly imported: ${successCount} songs`);
    console.log(`   ⊘ Already existed: ${skipCount} songs`);
    console.log(`   ⏱ Total time: ${elapsedTotal} seconds`);
    console.log(`   📁 Total in collection: ${totalSongs}`);
    console.log(`   📦 Dataset files: ${totalDatasetSongs}\n`);

    // Show sample data
    const sampleSong = await songsCollection.findOne({});
    if (sampleSong) {
      console.log('📋 Sample imported song:');
      console.log(`   Title: ${sampleSong.title}`);
      console.log(`   Filename: ${sampleSong.filename}`);
      console.log(`   File Size: ${(sampleSong.features.metadata.fileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Codec: ${sampleSong.features.metadata.codec}\n`);
    }

    await client.close();
    console.log('✓ MongoDB connection closed\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
  }
}

bulkImportFast();
