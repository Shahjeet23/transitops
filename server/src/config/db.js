'use strict';

const mongoose = require('mongoose');
const { mongoUri } = require('./env');

/**
 * Connect to MongoDB with sensible options and event logging.
 */
async function connectDB() {
  mongoose.connection.on('connected', () => {
    console.log('[DB] MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[DB] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] MongoDB disconnected');
  });

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

/**
 * Gracefully close the MongoDB connection.
 */
async function disconnectDB() {
  await mongoose.connection.close();
  console.log('[DB] MongoDB connection closed');
}

module.exports = { connectDB, disconnectDB };
