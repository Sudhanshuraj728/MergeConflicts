# 🚀 Quick Start - Postman Testing

**Everything is ready! Here's how to test in 5 minutes**

---

## 📦 Files Created for You

### 1. **Postman Collection File**
📄 `Audio_Identification_API.postman_collection.json`
- Complete collection with 16 test requests
- All endpoints organized in 6 folders
- Ready to import into Postman

### 2. **Testing Guide**
📄 `POSTMAN_TESTING_GUIDE.md`
- Step-by-step instructions for all tests
- Expected responses for each endpoint
- Troubleshooting section
- Performance benchmarks

---

## ⚡ 5-Minute Setup

### Step 1: Import Collection (1 min)
1. Open **Postman**
2. Click **Import** (top-left)
3. Select file: `Audio_Identification_API.postman_collection.json`
4. Click **Import**

### Step 2: Verify Server (30 sec)
In Postman, run the first request: **"Health Check"**
```
GET http://localhost:5000/api/health
```
✅ Should return 200 OK with status "healthy"

### Step 3: Start Testing (3.5 min)

Follow the 6 phases in order:

| Phase | Requests | Time |
|-------|----------|------|
| 1. System Health | 2 | 30s |
| 2. Upload Songs | 3 | 90s |
| 3. Query Database | 3 | 30s |
| 4. Audio Matching | 5 | 120s |
| 5. Data Management | 1 | 30s |
| 6. Rate Limiting | 2 | 30s |

---

## 📋 Request Organization

### Folder: System Health & Documentation
✅ Health Check
✅ API Documentation

### Folder: Upload Songs (Build Database)
📤 Upload Song #1
📤 Upload Song #2
📤 Upload Song #3

### Folder: Query Database
📊 List All Songs
📊 Get Song by ID
📊 Database Statistics

### Folder: Audio Matching (Core Feature)
🎵 Match Audio - Default Settings
🎵 Match Audio - Top 10 Results
🎵 Match Audio - Strict Threshold
🎵 Match Audio - Loose Threshold
🎵 Match Audio - Custom Parameters

### Folder: Data Management
🗑️ Delete Song

### Folder: Rate Limiting Test
⏱️ Rate Limit - Request 1
⏱️ Rate Limit - Request 2

---

## 🎯 Key Test Scenarios

### Scenario 1: Verify System Works
1. Health Check → 200 ✓
2. API Docs → 200 ✓
3. Upload Song → 200 ✓
4. List Songs → 200 ✓
5. Match Audio → 200 ✓

**Time: 2-3 minutes**
**Result: "Backend is ready!"**

### Scenario 2: Test Matching Algorithm
1. Upload 3 different songs
2. Run Match Audio 5 times (different parameters)
3. Verify confidence scores make sense
4. Check 4 dimensions breakdown

**Time: 3-5 minutes**
**Result: "Matching works correctly!"**

### Scenario 3: Test Performance
1. Upload song → Note time
2. Match query → Note time
3. Match again → Check total < 500ms
4. Check database stats → Verify 2-3KB per song

**Time: 2 minutes**
**Result: "Performance is acceptable!"**

---

## 💾 Important: Upload Real Audio Files

Before testing **Upload Songs**, prepare 3 audio files:

**Supported formats:**
- ✅ MP3 (.mp3)
- ✅ WAV (.wav)
- ✅ FLAC (.flac)
- ✅ M4A (.m4a)
- ✅ OGG (.ogg)

**Requirements:**
- At least 1 second duration
- Maximum 30 MB
- Playable on your system

**Example:** Any music from your computer or test clips

---

## 🎯 Test Sequence Checklist

### Phase 1: System Health (30 seconds)
- [ ] Click "Health Check" → Expect 200
- [ ] Click "API Documentation" → Expect 200

### Phase 2: Upload Songs (3 minutes)
- [ ] Select "Upload Song #1"
- [ ] Click "Body" → "form-data"
- [ ] Set songFile: Click "Select File" → Choose audio1.mp3
- [ ] Set title: "Test Song 1"
- [ ] Click Send → Expect 200
- [ ] **Copy the song ID from response** ← Important!
- [ ] Repeat for "Upload Song #2" and "Upload Song #3"

### Phase 3: Query Database (1 minute)
- [ ] Click "List All Songs" → Expect 200, shows 3 songs
- [ ] Click "Get Song by ID" 
- [ ] Replace ID in URL with one from Phase 2
- [ ] Click Send → Expect 200
- [ ] Click "Database Statistics" → Expect 200

### Phase 4: Audio Matching (2 minutes) ⭐
- [ ] Click "Match Audio - Default Settings"
- [ ] In Body, select a query audio file
- [ ] Click Send → Expect 200
- [ ] **Check matchingFeatures** (4 dimensions)
- [ ] **Check processingStages** (4 stages)
- [ ] **Check confidence** (0-100%)
- [ ] Try other matching requests with different parameters

### Phase 5: Data Management (30 seconds)
- [ ] Click "Delete Song"
- [ ] Replace ID in URL with one from Phase 2
- [ ] Click Send → Expect 200
- [ ] Run "List All Songs" → Expect 2 songs now

### Phase 6: Rate Limiting (30 seconds)
- [ ] Send "Rate Limit - Request 1" → Check headers
- [ ] Look for: X-RateLimit-Limit: 30
- [ ] Look for: X-RateLimit-Remaining: decreases

---

## 📊 What Each Endpoint Does

### Health Check
**Purpose:** Verify server is running
**Response:** System status, version, features
**Time:** < 50ms

### Upload Song
**Purpose:** Add audio to database
**Response:** Song ID, metadata, processing time
**Time:** 50-300ms

### Match Audio ⭐
**Purpose:** Find matching songs in database
**Response:** Best match, top N, 4 dimensions, stages
**Time:** 200-500ms

### List Songs
**Purpose:** See all uploaded songs
**Response:** Array of songs with IDs
**Time:** < 100ms

### Database Statistics
**Purpose:** See system performance metrics
**Response:** Total songs, memory usage, accuracy
**Time:** < 100ms

---

## ✅ Success Criteria

After following all 6 phases, you should see:

- [x] All responses have status code 200 (except rate limit test)
- [x] All successful responses have `"success": true`
- [x] Upload responses include processing metrics (50-300ms)
- [x] Match responses include all 4 matching dimensions
- [x] Match responses include 4 processing stages
- [x] Database shows songs are persisted
- [x] Delete operation reduces song count
- [x] Rate limit headers are present (X-RateLimit-*)

**If all above ✅, your backend is ready for production!**

---

## 🎓 Understanding Match Response

When you run "Match Audio", look for this structure:

```json
{
  "bestMatch": {
    "id": "...",
    "title": "...",
    "confidence": 92    ← 0-100% score
  },
  "matchingFeatures": {
    "waveformMatch": 0.92,          ← 25% weight
    "spectralMatch": 0.98,          ← 35% weight (PRIMARY)
    "signatureMatch": 0.84,         ← 25% weight
    "metadataMatch": 0.91           ← 15% weight
  },
  "processingStages": [
    { "label": "Extracting waveform", "time": 87 },
    { "label": "Generating fingerprint", "time": 43 },
    { "label": "Comparing database", "time": 156 },
    { "label": "Calculating similarity", "time": 18 }
  ]
}
```

**This is the core algorithm working!**

---

## 🚨 If Something Goes Wrong

### "Connection refused"
```
→ Start server: cd backend && npm start
```

### "404 Not Found"
```
→ Check URL matches endpoint (case-sensitive)
→ Verify base_url variable is set to http://localhost:5000
```

### "Upload fails - File too large"
```
→ Use file < 30MB
→ Try .mp3 format
```

### "Low confidence scores"
```
→ Normal for different songs
→ Try uploading and matching the SAME song (should be 90%+)
```

### "Rate limit hit"
```
→ Wait 1 minute for limit to reset
→ Or slow down requests
```

---

## 🎉 You're Ready!

1. ✅ Open Postman
2. ✅ Import `Audio_Identification_API.postman_collection.json`
3. ✅ Run Health Check
4. ✅ Follow the 6 phases
5. ✅ Check all tests pass

**Everything should work. Let's go test! 🎵**

---

## 📞 Reference

- **Backend running?** → Check `/api/health`
- **Need API details?** → Check `/api/docs`
- **Testing confused?** → Read `POSTMAN_TESTING_GUIDE.md`
- **Code questions?** → Check comments in `src/utils/*.js`
