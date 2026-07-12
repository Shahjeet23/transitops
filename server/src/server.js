'use strict';

const { connectDB } = require('./config/db');
const { port, nodeEnv } = require('./config/env');
const app = require('./app');

let server;

async function startServer() {
  try {
    // Connect to MongoDB first — fail fast if DB is unavailable
    await connectDB();

    server = app.listen(port, () => {
      console.log(`[Server] TransitOps API running in ${nodeEnv} mode`);
      console.log(`[Server] Listening on http://localhost:${port}`);
      console.log(`[Server] Health check: http://localhost:${port}/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function gracefulShutdown(signal) {
  console.log(`\n[Server] ${signal} received — shutting down gracefully`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP server closed');
      const { disconnectDB } = require('./config/db');
      await disconnectDB();
      process.exit(0);
    });
    // Force shutdown after 10s if connections are taking too long
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ─── Safety nets ──────────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  // Trigger graceful shutdown
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

startServer();
