const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const AdmZip = require('adm-zip');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Import audio processing pipeline
const AudioProcessingPipeline = require('./src/utils/audioProcessingPipeline');
const { v4: uuidv4 } = require('uuid');

const BATCH_SIZE = 50;
const ALLOWED_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'];

async function importDataset() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'mergeconflicts';
  const zipPath = 'c:\\Users\\sudha\\Downloads\\data.zip';

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║              🎵 BULK AUDIO IMPORT SYSTEM 🎵              ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Extract ZIP and list files
    console.log('STEP 1: Extracting and analyzing ZIP file...\n');
    
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

    console.log(`✓ ZIP extracted`);
    console.log(`✓ Total entries in ZIP: ${zipEntries.length}`);
    console.log(`✓ Audio files found: ${audioFiles.length}\n`);

    if (audioFiles.length === 0) {
      console.error('❌ No audio files found in ZIP');
      return;
    }

    // Step 2: Connect to MongoDB
    console.log('STEP 2: Connecting to MongoDB...\n');
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('✓ Connected to MongoDB\n');

    const db = client.db(dbName);
    const songsCollection = db.collection('songs');

    // Create index on uploadedBy for faster queries
    await songsCollection.createIndex({ uploadedBy: 1 });
    console.log('✓ Indexes created\n');

    // Step 3: Process files in batches
    console.log('STEP 3: Processing audio files in batches...\n');
    
    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
    const batchDocuments = [];
    const tempExtractDir = path.join(__dirname, 'temp-import');

    // Create temp directory
    if (!fs.existsSync(tempExtractDir)) {
      fs.mkdirSync(tempExtractDir, { recursive: true });
    }

    const startTime = Date.now();

    for (let i = 0; i < audioFiles.length; i++) {
      const entry = audioFiles[i];
      const fileExt = path.extname(entry.name).toLowerCase().slice(1);
      const fileName = path.basename(entry.name);
      
      try {
        // Extract file to temp directory
        const tempFilePath = path.join(tempExtractDir, `${Date.now()}-${i}-${fileName}`);
        fs.writeFileSync(tempFilePath, entry.getData());

        // Process audio file
        const features = await AudioProcessingPipeline.processUpload(tempFilePath, {
          originalName: fileName,
          mimeType: `audio/${fileExt}`
        });

        // Create song document
        const songDoc = {
          id: uuidv4(),
          title: fileName.replace(/\.[^.]+$/, ''),
          description: `Bulk imported from dataset - ${fileName}`,
          filename: fileName,
          features: features.features || {},
          metadata: {
            sampleRate: features.features?.metadata?.sampleRate || 44100,
            channels: features.features?.metadata?.channels || 2,
            codec: fileExt.toUpperCase(),
            duration: features.features?.metadata?.duration || 0,
            fileSize: entry.size
          },
          uploadedBy: null, // Dataset import (no specific user)
          createdAt: new Date(),
          uploadedAt: new Date()
        };

        batchDocuments.push(songDoc);
        successCount++;

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        // Process batch
        if (batchDocuments.length >= BATCH_SIZE || i === audioFiles.length - 1) {
          await songsCollection.insertMany(batchDocuments);
          processedCount += batchDocuments.length;
          
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const progress = ((processedCount / audioFiles.length) * 100).toFixed(1);
          console.log(`✓ Batch inserted: ${batchDocuments.length} songs | Total: ${processedCount}/${audioFiles.length} (${progress}%) | Time: ${elapsed}s`);
          
          batchDocuments.length = 0;
        }

      } catch (error) {
        failureCount++;
        console.error(`✗ Failed to process ${fileName}: ${error.message}`);
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    }

    // Step 4: Verify import
    console.log('\nSTEP 4: Verifying import...\n');
    const totalSongs = await songsCollection.countDocuments({});
    console.log(`✓ Total songs in collection: ${totalSongs}`);

    const stats = await songsCollection.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgFileSize: { $avg: '$metadata.fileSize' }
        }
      }
    ]).toArray();

    if (stats.length > 0) {
      console.log(`✓ Average file size: ${(stats[0].avgFileSize / 1024 / 1024).toFixed(2)} MB`);
    }

    const elapsedTotal = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ IMPORT COMPLETE ✅                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Import Summary:`);
    console.log(`   ✓ Successfully imported: ${successCount} songs`);
    console.log(`   ✗ Failed: ${failureCount} songs`);
    console.log(`   ⏱ Total time: ${elapsedTotal} seconds`);
    console.log(`   📁 Total in collection: ${totalSongs}`);
    console.log(`   📦 Average file size: ${(stats[0]?.avgFileSize / 1024 / 1024).toFixed(2) || 0} MB\n`);

    await client.close();
    console.log('✓ MongoDB connection closed\n');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error(error);
  }
}

importDataset();
