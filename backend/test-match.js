const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function runMatchTest() {
  const base = 'http://localhost:5000/api';
  const email = 'shudhanshuu123@gmail.com';
  const password = 'TestPassword123';

  try {
    console.log('\n== Fingerprint & Matching Test ==\n');

    // Login
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('Logged in. User:', loginData.user.email);

    // Generate small WAV file
    const sampleRate = 22050;
    const durationSeconds = 2;
    const frequency = 440;
    const amplitude = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = sampleRate * durationSeconds;
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < numSamples; i++) {
      const sample = Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude);
      buffer.writeInt16LE(sample, 44 + i * 2);
    }

    const wavPath = path.join(__dirname, `match-test-${Date.now()}.wav`);
    fs.writeFileSync(wavPath, buffer);
    console.log('Generated test WAV:', wavPath);

    // Build form and call match endpoint
    const form = new FormData();
    // Field must match server's expected name: 'queryFile'
    form.append('queryFile', new Blob([buffer], { type: 'audio/wav' }), 'match-test.wav');

    console.log('Sending to /api/songs/match ...');
    const matchRes = await fetch(`${base}/songs/match`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form
    });

    const matchData = await matchRes.json();
    console.log('Response status:', matchRes.status);
    console.log('Match response:', JSON.stringify(matchData, null, 2));

    fs.unlinkSync(wavPath);
    console.log('Temporary WAV removed.');

    if (matchRes.status === 200 && matchData.bestMatch) {
      console.log('\n✅ Matching pipeline works — fingerprint generated & match returned.');
    } else {
      console.log('\n❌ Matching pipeline returned no best match or error.');
    }

  } catch (err) {
    console.error('Error during match test:', err);
  }
}

runMatchTest();
