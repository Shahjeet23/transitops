'use strict';

const { sendError } = require('../utils/response.util');

/**
 * Middleware factory: validates req.body against a Zod schema.
 * On failure returns 422 with structured field errors.
 *
 * @param {import('zod').ZodSchema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return sendError(res, 'Validation failed', 422, errors);
    }
    // Replace body with parsed (coerced + trimmed) data
    req.body = result.data;
    next();
  };
}

module.exports = validate;
