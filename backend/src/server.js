require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
// Prescriptions are uploaded as base64 data URLs in JSON bodies, so the
// default 100kb express.json() limit would reject most images/PDFs with a 413.
// 15mb keeps payloads under MongoDB's 16mb document limit (~11mb binary after
// base64 overhead).
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const shopRoutes = require('./routes/shopRoutes');
const publicRoutes = require('./routes/publicRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date()
  });
});

// Test DB endpoint - verify connection, DB name, and collection names
app.get('/api/test-db', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not connected' });
    }
    const collections = await db.listCollections().toArray();
    res.status(200).json({
      dbName: db.databaseName,
      collections: collections.map(c => c.name),
      connectionState: mongoose.connection.readyState, // 1 = connected
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Connect to Database, then start server
async function start() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Successfully connected to MongoDB.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
