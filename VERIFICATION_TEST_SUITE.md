# ✅ VERIFICATION TEST SUITE

**Automated verification of all testing requirements**

---

## 📋 Requirements to Verify

- [x] All responses have status 200 (except rate limit)
- [x] Upload shows 50-300ms feature extraction
- [x] Match shows 4 matching dimensions
- [x] Match shows 4 processing stages
- [x] Confidence scores are 0-100%
- [x] Database persists songs
- [x] Delete reduces song count
- [x] Rate limit headers present

---

## 🎯 Verification Tests

### Test 1: Health Check
```bash
curl -i http://localhost:5000/api/health
```

**Verification:**
- Status: 200 ✓
- Response: `{"success": true, "status": "healthy"}`

---

### Test 2: API Documentation
```bash
curl -i http://localhost:5000/api/docs
```

**Verification:**
- Status: 200 ✓
- Contains complete API reference

---

### Test 3: Upload Song (Feature Extraction Time)
```bash
curl -i -X POST http://localhost:5000/api/songs/upload \
  -F "songFile=@song.mp3" \
  -F "title=Test Song"
```

**Verification Points:**
- Status: 200 ✓
- `processingMetrics.totalTime`: 50-300ms ✓
- `featuresExtracted` contains:
  - `metadataFields`: 6 ✓
  - `waveformSamples`: 8 ✓
  - `spectralBands`: 16 ✓
  - `signatureFields`: 5 ✓

**Expected Response:**
```json
{
  "success": true,
  "processingMetrics": {
    "totalTime": 245,
    "featuresExtracted": {
      "metadataFields": 6,
      "waveformSamples": 8,
      "spectralBands": 16,
      "signatureFields": 5
    }
  }
}
```

---

### Test 4: List Songs (Database Persistence)
```bash
curl -i http://localhost:5000/api/songs
```

**Verification:**
- Status: 200 ✓
- Returns array of songs ✓
- Songs persist from previous uploads ✓

---

### Test 5: Match Audio (4 Dimensions + 4 Stages)
```bash
curl -i -X POST http://localhost:5000/api/songs/match \
  -F "queryFile=@query.mp3"
```

**Verification Points:**
- Status: 200 ✓
- `matchingFeatures` has 4 dimensions:
  - `waveformMatch`: 0-1 ✓
  - `spectralMatch`: 0-1 ✓
  - `signatureMatch`: 0-1 ✓
  - `metadataMatch`: 0-1 ✓
- `confidence`: 0-100 ✓
- `processingStages` has 4 items:
  - Stage 1: Extracting waveform ✓
  - Stage 2: Generating fingerprint ✓
  - Stage 3: Comparing database ✓
  - Stage 4: Calculating similarity ✓

**Expected Response:**
```json
{
  "success": true,
  "confidence": 92,
  "matchingFeatures": {
    "waveformMatch": 0.923,
    "spectralMatch": 0.976,
    "signatureMatch": 0.843,
    "metadataMatch": 0.912
  },
  "processingStages": [
    { "id": 1, "label": "Extracting waveform", "time": 87, "completed": true },
    { "id": 2, "label": "Generating fingerprint", "time": 43, "completed": true },
    { "id": 3, "label": "Comparing database", "time": 156, "completed": true },
    { "id": 4, "label": "Calculating similarity", "time": 18, "completed": true }
  ]
}
```

---

### Test 6: Delete Song (Count Reduction)
```bash
# First, get song count
curl http://localhost:5000/api/songs | jq '.count'
# Result: 3

# Delete one song (use ID from previous response)
curl -i -X DELETE http://localhost:5000/api/songs/{song-id}

# Verify count reduced
curl http://localhost:5000/api/songs | jq '.count'
# Result: 2
```

**Verification:**
- Status: 200 ✓
- `remainingSongs`: Decreased by 1 ✓
- List songs: New count is lower ✓

---

### Test 7: Rate Limit Headers
```bash
curl -i http://localhost:5000/api/songs/match \
  -F "queryFile=@query.mp3"
```

**Verification - Look for headers:**
- `X-RateLimit-Limit: 30` ✓
- `X-RateLimit-Remaining: 29` (decreases with each request) ✓
- `X-RateLimit-Reset: {unix-timestamp}` ✓

---

### Test 8: Rate Limit Exceeded (Optional)
Send 31 rapid requests to `/api/songs/match`

**Verification:**
- Request 1-30: Status 200 ✓
- Request 31+: Status 429 ✓
- Error message: "Rate limit exceeded" ✓

---

## 🔍 Detailed Verification Checklist

### ✅ Status Code Verification

| Endpoint | Method | Expected Status | Verified |
|----------|--------|-----------------|----------|
| /api/health | GET | 200 | [ ] |
| /api/docs | GET | 200 | [ ] |
| /api/songs/upload | POST | 200 | [ ] |
| /api/songs | GET | 200 | [ ] |
| /api/songs/:id | GET | 200 | [ ] |
| /api/songs/match | POST | 200 | [ ] |
| /api/songs/:id | DELETE | 200 | [ ] |
| /api/songs/stats/matching | GET | 200 | [ ] |
| Rate limit exceeded | POST | 429 | [ ] |

---

### ✅ Feature Extraction Verification

```json
{
  "processingMetrics": {
    "totalTime": "50-300ms?",  ← Should be in this range
    "featuresExtracted": {
      "metadataFields": 6,     ← Exactly 6
      "waveformSamples": 8,    ← Exactly 8
      "spectralBands": 16,     ← Exactly 16
      "signatureFields": 5     ← Exactly 5
    }
  }
}
```

**Check:**
- [ ] Metadata: 6 fields (duration, bitrate, sample rate, channels, codec, file size)
- [ ] Waveform: 8 measures (RMS, peak, ZCR, centroid, spread, entropy, crest, flatness)
- [ ] Spectral: 16 bands (frequency distribution)
- [ ] Signature: 5 fields (hashes and energy profile)

---

### ✅ Matching Algorithm Verification

```json
{
  "confidence": 92,            ← 0-100 scale
  "matchingFeatures": {
    "waveformMatch": 0.923,    ← 0-1 scale (92.3%)
    "spectralMatch": 0.976,    ← 0-1 scale (97.6%) PRIMARY
    "signatureMatch": 0.843,   ← 0-1 scale (84.3%)
    "metadataMatch": 0.912     ← 0-1 scale (91.2%)
  }
}
```

**Check:**
- [ ] Confidence: 0 ≤ value ≤ 100
- [ ] Waveform dimension: 0 ≤ value ≤ 1
- [ ] Spectral dimension: 0 ≤ value ≤ 1
- [ ] Signature dimension: 0 ≤ value ≤ 1
- [ ] Metadata dimension: 0 ≤ value ≤ 1
- [ ] Sum of weighted dimensions = confidence ✓

---

### ✅ Processing Stages Verification

```json
{
  "processingStages": [
    {
      "id": 1,
      "label": "Extracting waveform",
      "time": 87,
      "completed": true
    },
    {
      "id": 2,
      "label": "Generating fingerprint",
      "time": 43,
      "completed": true
    },
    {
      "id": 3,
      "label": "Comparing database",
      "time": 156,
      "completed": true
    },
    {
      "id": 4,
      "label": "Calculating similarity",
      "time": 18,
      "completed": true
    }
  ]
}
```

**Check:**
- [ ] 4 stages present
- [ ] Each stage has id, label, time, completed
- [ ] All completed: true
- [ ] Time values are positive integers (milliseconds)
- [ ] Total time = sum of all stage times

---

### ✅ Database Persistence Verification

**Step 1: Upload songs**
```bash
curl -X POST http://localhost:5000/api/songs/upload -F "songFile=@song1.mp3" -F "title=Song1"
curl -X POST http://localhost:5000/api/songs/upload -F "songFile=@song2.mp3" -F "title=Song2"
curl -X POST http://localhost:5000/api/songs/upload -F "songFile=@song3.mp3" -F "title=Song3"
```

**Step 2: List songs**
```bash
curl http://localhost:5000/api/songs | jq '.count'
# Expected: 3
```

**Step 3: Retrieve by ID**
```bash
curl http://localhost:5000/api/songs/{id} | jq '.song.id'
# Expected: {id}
```

**Check:**
- [ ] After upload, count = 3
- [ ] After restart, count still = 3 (persistence)
- [ ] Songs have unique IDs
- [ ] Retrieve by ID returns correct song

---

### ✅ Delete Operation Verification

**Step 1: Get current count**
```bash
curl http://localhost:5000/api/songs | jq '.count'
# Expected: 3
```

**Step 2: Delete one song**
```bash
curl -X DELETE http://localhost:5000/api/songs/{id}
# Response: {"success": true, "remainingSongs": 2}
```

**Step 3: Verify new count**
```bash
curl http://localhost:5000/api/songs | jq '.count'
# Expected: 2
```

**Check:**
- [ ] Delete returns 200
- [ ] remainingSongs: decremented by 1
- [ ] List songs shows new count
- [ ] Deleted song no longer in list

---

### ✅ Rate Limit Verification

**Step 1: Send one request and check headers**
```bash
curl -i http://localhost:5000/api/songs/match -F "queryFile=@query.mp3"
```

**Headers to verify:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1705321800
```

**Check:**
- [ ] X-RateLimit-Limit header present, value = 30
- [ ] X-RateLimit-Remaining header present, starts at 29
- [ ] X-RateLimit-Reset header present, is Unix timestamp
- [ ] Remaining decreases with each request
- [ ] After 30 requests, returns 429

---

## 📊 Summary Report Template

### Overall Status
- [ ] All 8 endpoints return 200 (except rate limit)
- [ ] Feature extraction time: 50-300ms
- [ ] 4 matching dimensions present
- [ ] 4 processing stages present
- [ ] Confidence scores 0-100%
- [ ] Database persists songs
- [ ] Delete reduces count
- [ ] Rate limit headers present

### Details

**Endpoint Tests:**
- [ ] GET /api/health: 200
- [ ] GET /api/docs: 200
- [ ] POST /api/songs/upload: 200
- [ ] GET /api/songs: 200
- [ ] GET /api/songs/:id: 200
- [ ] POST /api/songs/match: 200
- [ ] DELETE /api/songs/:id: 200
- [ ] GET /api/songs/stats/matching: 200

**Feature Extraction:**
- [ ] Metadata: 6 fields
- [ ] Waveform: 8 measures
- [ ] Spectral: 16 bands
- [ ] Signature: 5 fields
- [ ] Time: 50-300ms

**Matching Algorithm:**
- [ ] Waveform dimension: present (25% weight)
- [ ] Spectral dimension: present (35% weight)
- [ ] Signature dimension: present (25% weight)
- [ ] Metadata dimension: present (15% weight)
- [ ] Confidence: 0-100%

**Processing Stages:**
- [ ] Stage 1: Extracting waveform
- [ ] Stage 2: Generating fingerprint
- [ ] Stage 3: Comparing database
- [ ] Stage 4: Calculating similarity

**Data Management:**
- [ ] Songs persist after upload
- [ ] Songs persist after restart
- [ ] Delete removes song
- [ ] Count decrements after delete

**Rate Limiting:**
- [ ] X-RateLimit-Limit: 30
- [ ] X-RateLimit-Remaining: decreases
- [ ] X-RateLimit-Reset: present
- [ ] 429 after 30 requests

---

## 🎯 How to Run This Verification

### Using Postman (Recommended)
1. Import: `Audio_Identification_API.postman_collection.json`
2. Run through all 16 requests
3. Verify each response against checklist above

### Using curl (Terminal)
```bash
# Health Check
curl -i http://localhost:5000/api/health

# Upload Song
curl -i -X POST http://localhost:5000/api/songs/upload \
  -F "songFile=@your_song.mp3" \
  -F "title=Test Song"

# List Songs
curl -i http://localhost:5000/api/songs

# Match Audio
curl -i -X POST http://localhost:5000/api/songs/match \
  -F "queryFile=@query.mp3"

# Check Rate Limit Headers
curl -i http://localhost:5000/api/songs/match \
  -F "queryFile=@query.mp3" | grep -i "X-RateLimit"
```

### Using Postman Tests (Advanced)
Pre-written tests in Postman collection check:
- Status codes
- Response structure
- Field presence
- Value ranges
- Headers

---

## ✅ Final Verification Checklist

### Prerequisites
- [ ] Backend running on port 5000
- [ ] ffmpeg installed
- [ ] npm dependencies installed
- [ ] Song database file exists

### Core Functionality
- [ ] Health endpoint works
- [ ] Upload endpoint works
- [ ] Match endpoint works
- [ ] List endpoint works
- [ ] Get by ID endpoint works
- [ ] Delete endpoint works
- [ ] Stats endpoint works

### Feature Requirements
- [ ] Status codes: 200 ✓
- [ ] Feature extraction: 50-300ms ✓
- [ ] 4 dimensions: present ✓
- [ ] 4 stages: present ✓
- [ ] Confidence: 0-100% ✓
- [ ] Database persists ✓
- [ ] Delete works ✓
- [ ] Rate limit headers ✓

### Quality Checks
- [ ] No error messages
- [ ] All responses have "success" field
- [ ] All responses have "message" field
- [ ] Response times acceptable
- [ ] Data is consistent
- [ ] Rate limiting enforced

---

## 🎉 If All Checks Pass

```
✅ All status codes are 200 (except 429 for rate limit)
✅ Feature extraction shows 50-300ms
✅ Matching shows 4 dimensions
✅ Matching shows 4 processing stages
✅ Confidence scores range 0-100%
✅ Database persists songs
✅ Delete operation reduces song count
✅ Rate limit headers present

RESULT: Backend is production-ready! 🚀
```

---

## 🔧 Troubleshooting Failures

### Status Code Issues
**Problem:** Not getting 200
**Solution:** 
- Check backend is running: `npm start`
- Check port 5000 is not in use
- Check error logs in terminal

### Feature Extraction Time
**Problem:** Time outside 50-300ms
**Solution:**
- FFmpeg might be slow on your system
- Try with smaller audio files
- Check CPU usage

### Missing Dimensions
**Problem:** Only 3 of 4 dimensions
**Solution:**
- Check audioMatcher.js has all comparisons
- Check response formatting in audioProcessingPipeline.js

### Missing Stages
**Problem:** Only 3 of 4 stages
**Solution:**
- Check static PROCESSING_STAGES in audioProcessingPipeline.js
- Verify all 4 stages are formatted in response

### Confidence Out of Range
**Problem:** Confidence > 100 or < 0
**Solution:**
- Check confidence calculation in audioMatcher.js
- Verify exponential curve: score^0.8 * 100
- Check bounds checking

### Database Not Persisting
**Problem:** Songs deleted after restart
**Solution:**
- Check fileStore.js path points to `/data/song-db.json`
- Verify file has read/write permissions
- Check no errors in console

### Delete Not Reducing Count
**Problem:** Count doesn't change after delete
**Solution:**
- Check songModel.js delete function
- Verify database write operation
- Check file permissions

### No Rate Limit Headers
**Problem:** Headers missing from response
**Solution:**
- Check audioMiddleware.js adds headers
- Verify rate limiting middleware is in pipeline
- Check header names are correct (X-RateLimit-*)

---

**Follow this guide to verify all 8 requirements are met!** ✅
