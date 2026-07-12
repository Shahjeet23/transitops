'use strict';

const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');
const AppError = require('./AppError');

/**
 * Generate a short-lived access token.
 * @param {{ id: string, role: string }} payload
 * @returns {string}
 */
function generateAccessToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: 'transitops',
  });
}

/**
 * Generate a long-lived refresh token.
 * @param {{ id: string }} payload
 * @returns {string}
 */
function generateRefreshToken(payload) {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: 'transitops',
  });
}

/**
 * Verify an access token and return its decoded payload.
 * Throws AppError 401 on failure.
 * @param {string} token
 * @returns {object}
 */
function verifyAccessToken(token) {
  try {
    return jwt.verify(token, jwtConfig.secret, { issuer: 'transitops' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401);
    }
    throw new AppError('Invalid access token', 401);
  }
}

/**
 * Verify a refresh token and return its decoded payload.
 * Throws AppError 401 on failure.
 * @param {string} token
 * @returns {object}
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, jwtConfig.refreshSecret, { issuer: 'transitops' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired, please log in again', 401);
    }
    throw new AppError('Invalid refresh token', 401);
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
