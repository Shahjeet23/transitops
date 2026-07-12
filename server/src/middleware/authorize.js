'use strict';

const { sendError } = require('../utils/response.util');

/**
 * Middleware factory: authorises the request based on user roles.
 * Must be used AFTER the `authenticate` middleware (requires req.user).
 *
 * Usage:
 *   router.get('/admin-only', authenticate, authorize('admin'), handler)
 *   router.get('/multi-role', authenticate, authorize('admin', 'fleet_manager'), handler)
 *
 * @param {...string} roles - Allowed role(s)
 * @returns {import('express').RequestHandler}
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied — required role(s): ${roles.join(', ')}`,
        403
      );
    }
    next();
  };
}

module.exports = authorize;
