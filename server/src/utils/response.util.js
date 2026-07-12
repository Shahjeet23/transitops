'use strict';

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {*}      data
 * @param {string} message
 * @param {number} statusCode
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} statusCode
 * @param {Array}  errors      - Optional field-level errors
 */
function sendError(res, message = 'An error occurred', statusCode = 500, errors = []) {
  const body = { success: false, message };
  if (errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a paginated JSON response.
 *
 * @param {import('express').Response} res
 * @param {Array}  data
 * @param {{ page: number, limit: number, total: number }} pagination
 * @param {string} message
 */
function sendPaginated(res, data, pagination, message = 'Success') {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}

module.exports = { sendSuccess, sendError, sendPaginated };
