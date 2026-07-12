'use strict';

/**
 * Wraps an async Express route handler so errors are forwarded to next().
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function} Express-compatible route handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
