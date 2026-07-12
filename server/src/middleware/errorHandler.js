'use strict';

const mongoose = require('mongoose');
const { sendError } = require('../utils/response.util');
const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

/**
 * Convert a Mongoose ValidationError to a flat array of field errors.
 */
function formatMongooseValidationError(err) {
  return Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
}

/**
 * Global Express error handling middleware.
 * Must be registered LAST in the middleware chain (4 arguments).
 *
 * Handles:
 *  - AppError (operational errors)
 *  - Mongoose ValidationError
 *  - Mongoose CastError (invalid ObjectId)
 *  - MongoDB duplicate key error (code 11000)
 *  - JWT errors (already converted to AppError in jwt.util.js)
 *  - Unknown/programming errors
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // ── 1. Operational errors we explicitly threw ────────────────────────────
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // ── 2. Mongoose document validation failure ──────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = formatMongooseValidationError(err);
    return sendError(res, 'Validation failed', 422, errors);
  }

  // ── 3. Mongoose CastError — usually invalid ObjectId in URL param ────────
  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, `Invalid value for field: ${err.path}`, 400);
  }

  // ── 4. MongoDB duplicate key (unique constraint) ─────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue?.[field];
    return sendError(res, `Duplicate value: ${field} '${value}' already exists`, 409);
  }

  // ── 5. Unknown / programming error ──────────────────────────────────────
  // Log full error in non-production environments
  if (nodeEnv !== 'production') {
    console.error('[ErrorHandler]', err);
  }

  return sendError(
    res,
    nodeEnv === 'production' ? 'Internal server error' : err.message,
    500
  );
}

module.exports = errorHandler;
