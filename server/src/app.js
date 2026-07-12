'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const { nodeEnv, clientUrl } = require('./config/env');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const { sendError } = require('./utils/response.util');

const app = express();

// ─── Security & CORS ─────────────────────────────────────────────────────────
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}


app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TransitOps API is running',
    environment: nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);


app.use((req, res) => {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

app.use(errorHandler);

module.exports = app;
