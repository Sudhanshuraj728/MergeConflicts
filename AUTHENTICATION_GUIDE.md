# 🔐 AUTHENTICATION & LOGIN/LOGOUT GUIDE

**Status:** ✅ Complete Implementation  
**Features:** Register | Login | Logout | Token Refresh | Profile Management

---

## 🎯 AUTHENTICATION SYSTEM OVERVIEW

Your backend now has a complete authentication system with:
- **User Registration** - Create new user accounts
- **User Login** - Get JWT authentication tokens
- **Token-Based Auth** - Secure API endpoints
- **Logout** - Invalidate tokens (client-side)
- **Profile Management** - View and update user info
- **Song Tracking** - Track songs uploaded per user

---

## 📋 AUTHENTICATION ENDPOINTS

### 1. REGISTER - Create New User Account
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "createdAt": "2026-05-06T07:15:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Validation:**
- ✅ Email required, must be valid format
- ✅ Password required, minimum 6 characters
- ✅ Confirm password must match
- ✅ Email must be unique (cannot register twice)

---

### 2. LOGIN - Authenticate User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "songsUploaded": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

**Validation:**
- ✅ Email and password both required
- ✅ Email must exist in database
- ✅ Password must match (case-sensitive)
- ✅ Token valid for 7 days

---

### 3. LOGOUT - Invalidate Token
```
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

**How it works:**
- ✅ No server-side token invalidation needed (stateless JWT)
- ✅ Client simply removes the token from local storage/sessionStorage
- ✅ Token becomes worthless without client storage

---

### 4. REFRESH TOKEN - Get New JWT
```
POST /api/auth/refresh
Authorization: Bearer {your_current_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "7d"
}
```

---

### 5. GET PROFILE - View User Info (Protected)
```
GET /api/auth/profile
Authorization: Bearer {your_token}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "songsUploaded": 5,
    "createdAt": "2026-05-06T07:15:00.000Z",
    "lastLogin": "2026-05-06T07:20:00.000Z"
  }
}
```

---

### 6. UPDATE PROFILE - Change User Info (Protected)
```
PUT /api/auth/profile
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "username": "newusername"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "newusername",
    "songsUploaded": 5
  }
}
```

---

## 🔐 PROTECTED ENDPOINTS (Require Authentication)

These endpoints now require a valid JWT token in the Authorization header:

### Upload Song (PROTECTED)
```
POST /api/songs/upload
Authorization: Bearer {your_token}
Content-Type: multipart/form-data

songFile: [audio file]
title: "Song Title"
description: "Optional description"
```

### Match Audio (PROTECTED)
```
POST /api/songs/match
Authorization: Bearer {your_token}
Content-Type: multipart/form-data

queryFile: [audio file]
topN: 5
threshold: 0.3
```

### Delete Song (PROTECTED)
```
DELETE /api/songs/{songId}
Authorization: Bearer {your_token}
```

---

## 📱 HOW TO USE IN POSTMAN

### Step 1: Register User
1. Open Postman
2. Create POST request to `http://localhost:5000/api/auth/register`
3. Set Body → raw → JSON
4. Paste:
```json
{
  "email": "testuser@example.com",
  "username": "testuser",
  "password": "Test123456",
  "confirmPassword": "Test123456"
}
```
5. Send
6. **Copy the token from response**

### Step 2: Login (or use token from Step 1)
1. Create POST request to `http://localhost:5000/api/auth/login`
2. Set Body → raw → JSON
3. Paste:
```json
{
  "email": "testuser@example.com",
  "password": "Test123456"
}
```
4. Send
5. **Copy the token from response**

### Step 3: Use Token for Upload
1. Create POST request to `http://localhost:5000/api/songs/upload`
2. Set Headers:
   - Key: `Authorization`
   - Value: `Bearer {paste-your-token-here}`
3. Set Body → form-data
   - Key: `songFile` (type: File)
   - Value: Select your audio file
4. Send
5. ✅ You should get 201 response with song details

### Step 4: Use Token for Match
1. Create POST request to `http://localhost:5000/api/songs/match`
2. Set Headers:
   - Key: `Authorization`
   - Value: `Bearer {paste-your-token-here}`
3. Set Body → form-data
   - Key: `queryFile` (type: File)
   - Value: Select another audio file
4. Send
5. ✅ You should get 200 response with matching results

### Step 5: Get Profile
1. Create GET request to `http://localhost:5000/api/auth/profile`
2. Set Headers:
   - Key: `Authorization`
   - Value: `Bearer {paste-your-token-here}`
3. Send
4. ✅ See your user profile with song count

---

## 🔑 TOKEN STRUCTURE

JWT tokens are structured as: `header.payload.signature`

**Payload contains:**
```json
{
  "userId": "uuid-of-user",
  "email": "user@example.com",
  "iat": 1715003700,
  "exp": 1715608500
}
```

**Token expires in:** 7 days

---

## 📊 USER DATABASE STRUCTURE

Users are stored in `/data/user-db.json`:

```json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "username": "johndoe",
      "passwordHash": "bcrypt-hashed-password",
      "createdAt": "2026-05-06T07:15:00.000Z",
      "updatedAt": "2026-05-06T07:15:00.000Z",
      "songsUploaded": 5,
      "lastLogin": "2026-05-06T07:20:00.000Z"
    }
  ]
}
```

**Security:**
- ✅ Passwords are hashed with bcryptjs (10 rounds)
- ✅ Plain passwords never stored
- ✅ Cannot be reversed

---

## 🚀 COMPLETE WORKFLOW

### New User Registration → Upload → Match

```
1. REGISTER
   POST /api/auth/register
   → Get token

2. LOGIN (optional, can use registration token)
   POST /api/auth/login
   → Get token

3. UPLOAD SONGS
   POST /api/songs/upload (with token)
   → Adds to database, increments songsUploaded

4. MATCH AUDIO
   POST /api/songs/match (with token)
   → Compare against uploaded songs

5. VIEW PROFILE
   GET /api/auth/profile (with token)
   → See songsUploaded count

6. LOGOUT
   POST /api/auth/logout
   → Remove token from client (local storage)
```

---

## ⚠️ ERROR RESPONSES

### Invalid Email/Password
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```
Status: 401

### Missing Token
```json
{
  "success": false,
  "error": "No token provided",
  "details": "Authorization header with Bearer token is required"
}
```
Status: 401

### Token Expired
```json
{
  "success": false,
  "error": "Token expired",
  "details": "Please login again to get a new token"
}
```
Status: 401

### User Already Exists
```json
{
  "success": false,
  "error": "User already exists with this email"
}
```
Status: 409

### Invalid Password
```json
{
  "success": false,
  "error": "Password must be at least 6 characters"
}
```
Status: 400

---

## 🔒 SECURITY FEATURES

### 1. Password Hashing
- ✅ Bcryptjs with 10 salt rounds
- ✅ Unique hash even for same password
- ✅ Computationally expensive (slow on purpose)

### 2. JWT Tokens
- ✅ Stateless (no server-side storage needed)
- ✅ Signed with secret key
- ✅ Expirable (7 days)
- ✅ Cannot be tampered with

### 3. Email Validation
- ✅ Format validation
- ✅ Unique per user
- ✅ Case-insensitive

### 4. Protected Routes
- ✅ Upload requires authentication
- ✅ Match requires authentication
- ✅ Delete requires authentication
- ✅ List/Stats are public

---

## 💾 WHAT GETS TRACKED

### User Data
```
- User ID (UUID)
- Email (unique)
- Username
- Password (hashed)
- Created date
- Updated date
- Songs uploaded (count)
- Last login time
```

### Song Data
```
- Song ID (UUID)
- Title
- Description
- Uploaded by (userId)
- Features (2-3 KB)
- Metadata
- Created date
```

**Database files:**
- `/data/user-db.json` - User accounts and profiles
- `/data/song-db.json` - Uploaded songs with features

---

## ✅ VERIFICATION CHECKLIST

- [x] User registration works ✅
- [x] User login returns token ✅
- [x] Token authentication works ✅
- [x] Upload protected ✅
- [x] Match protected ✅
- [x] Delete protected ✅
- [x] Song count tracked ✅
- [x] Profile view works ✅
- [x] Logout works ✅
- [x] Refresh token works ✅

---

## 📞 QUICK REFERENCE

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/auth/register | POST | No | Create account |
| /api/auth/login | POST | No | Get token |
| /api/auth/logout | POST | No | Logout |
| /api/auth/refresh | POST | Yes | Refresh token |
| /api/auth/profile | GET | Yes | View profile |
| /api/auth/profile | PUT | Yes | Update profile |
| /api/songs/upload | POST | Yes | Upload audio |
| /api/songs/match | POST | Yes | Match audio |
| /api/songs | GET | No | List all songs |
| /api/songs/:id | GET | No | Get song detail |
| /api/songs/:id | DELETE | Yes | Delete song |

---

## 🎉 YOU'RE READY!

✅ Authentication system fully implemented  
✅ Login/logout working  
✅ Upload protection active  
✅ Song tracking enabled  
✅ All features tested  

**Start testing with Postman collection!**

---

**Created:** May 6, 2026  
**Status:** ✅ PRODUCTION READY  
**Authentication:** ✅ COMPLETE  
**Security:** ✅ IMPLEMENTED
