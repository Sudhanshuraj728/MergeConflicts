const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const AdmZip = require('adm-zip');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { v4: uuidv4 } = require('uuid');

const BATCH_SIZE = 100;
const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];

async function quickImport() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'mergeconflicts';
  const zipPath = 'c:\\Users\\sudha\\Downloads\\data.zip';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           🎵 QUICK DATASET IMPORT (UPSERT MODE) 🎵        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('Loading dataset...\n');
    
    if (!fs.existsSync(zipPath)) {
      console.error(`❌ ZIP not found: ${zipPath}`);
      return;
    }

    const zip = new AdmZip(zipPath);
    const audioFiles = zip.getEntries().filter(entry => {
      if (entry.isDirectory) return false;
      const ext = path.extname(entry.name).toLowerCase().slice(1);
      return ALLOWED_FORMATS.includes(ext);
    });

    console.log(`✓ Found ${audioFiles.length} audio files\n`);

    // Connect to MongoDB
    const client = new MongoClient(mongoUri);
    await client.connect();
    const db = client.db(dbName);
    const songsCollection = db.collection('songs');
    
    console.log('✓ Connected to MongoDB');
    await songsCollection.createIndex({ filename: 1 }, { unique: true });
    console.log('✓ Indexes ready\n');

    // Bulk import with upsert
    console.log('Importing songs...\n');
    
    let insertedCount = 0;
    let updatedCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < audioFiles.length; i += BATCH_SIZE) {
      const batch = audioFiles.slice(i, i + BATCH_SIZE);
      const operations = [];

      for (const entry of batch) {
        const fileName = path.basename(entry.name);
        const ext = path.extname(fileName).toLowerCase().slice(1);

        const songDoc = {
          id: uuidv4(),
          title: fileName.replace(/\.[^.]+$/, ''),
          description: `Dataset import - ${fileName}`,
          filename: fileName,
          features: {
            waveformStats: { rms: 0, peak: 0, zcr: 0 },
            spectralFingerprint: { bands: [] },
            audioSignature: {},
            anchorPoints: [],
            metadata: {
              sampleRate: 44100,
              channels: 2,
              codec: ext.toUpperCase(),
              duration: 0,
              fileSize: entry.size
            }
          },
          uploadedBy: null,
          createdAt: new Date()
        };

        operations.push({
          updateOne: {
            filter: { filename: fileName },
            update: { $set: songDoc },
            upsert: true
          }
        });
      }

      // Execute batch
      if (operations.length > 0) {
        const result = await songsCollection.bulkWrite(operations);
        insertedCount += result.upsertedCount;
        updatedCount += result.modifiedCount;

        const processed = Math.min(i + BATCH_SIZE, audioFiles.length);
        const progress = ((processed / audioFiles.length) * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`✓ Batch ${Math.ceil(processed / BATCH_SIZE)}: ${processed}/${audioFiles.length} (${progress}%) | ${elapsed}s`);
      }
    }

    // Verify
    console.log('\nVerifying...\n');
    const total = await songsCollection.countDocuments({});
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ IMPORT COMPLETE ✅                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Results:`);
    console.log(`   ✓ New songs inserted: ${insertedCount}`);
    console.log(`   ↻ Existing songs updated: ${updatedCount}`);
    console.log(`   ⏱ Total time: ${elapsed} seconds`);
    console.log(`   📁 Total songs in database: ${total}\n`);

    await client.close();
    console.log('✓ Connection closed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('E11000')) {
      console.log('\n💡 Tip: Duplicate filename detected. This is normal if importing the same dataset twice.');
    }
  }
}

quickImport();
