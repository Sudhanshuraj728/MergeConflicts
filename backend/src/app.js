const express = require('express');
const cors = require('cors');
const path = require('path');
const songRoutes = require('./routes/songRoutes');
const authRoutes = require('./routes/authRoutes');
const AudioMiddleware = require('./middleware/audioMiddleware');
const { ensureUploadDirectories } = require('./utils/fileStore');
const { ensureUsersDatabase } = require('./models/userModel');

const app = express();

// CORS & Body Parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize databases
ensureUploadDirectories();
ensureUsersDatabase();

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/**
 * API Routes
 */

// Health check endpoint
app.get('/api/health', AudioMiddleware.healthCheck);

// API documentation
app.get('/api/docs', AudioMiddleware.apiDocs);

// Authentication routes (no prefix, mounted at /api/auth)
app.use('/api/auth', authRoutes);

// Song routes (with /api/songs prefix)
app.use('/api/songs', songRoutes);

// 404 handler
app.use(AudioMiddleware.notFound);

// Global error handler (must be last)
app.use(AudioMiddleware.errorHandler);

module.exports = app;
