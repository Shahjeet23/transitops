'use strict';

const { verifyAccessToken } = require('../utils/jwt.util');
const { sendError } = require('../utils/response.util');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');


const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required — no token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('-password -refreshToken').lean();
  if (!user) {
    return sendError(res, 'User no longer exists', 401);
  }
  if (!user.isActive) {
    return sendError(res, 'Your account has been deactivated. Contact an admin.', 403);
  }

  req.user = user;
  next();
});

module.exports = authenticate;
