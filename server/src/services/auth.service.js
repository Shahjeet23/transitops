'use strict';

const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate an access + refresh token pair for a user and persist the
 * hashed refresh token to the database.
 *
 * @param {import('../models/User').default} user
 * @returns {{ accessToken: string, refreshToken: string }}
 */
async function _issueTokenPair(user) {
  const payload = { id: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user._id.toString() });

  // Hash the refresh token before persisting (salt 10 is fine — it's not user-facing)
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(user._id, { refreshToken: hashedRefresh });

  return { accessToken, refreshToken };
}

// ─── Service methods ──────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Admin role is reserved and cannot be self-registered.
 * @param {{ name, email, password, role }} data
 * @returns {object} Sanitized user
 */
async function registerUser(data) {
  const { name, email, password, role } = data;

  // Admin is a privileged role — only created via the seeder
  if (role === 'admin') {
    throw new AppError('Admin accounts cannot be created via registration. Contact your system administrator.', 403);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError('A user with this email already exists', 409);
  }

  const user = await User.create({ name, email, password, role });
  return user.toPublic();
}


/**
 * Authenticate a user with email + password. Returns tokens.
 * @param {string} email
 * @param {string} password
 * @returns {{ user: object, accessToken: string, refreshToken: string }}
 */
async function loginUser(email, password) {
  // Explicitly select password since it's excluded by default
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Contact an admin.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save({ validateModifiedOnly: true });

  const { accessToken, refreshToken } = await _issueTokenPair(user);

  return { user: user.toPublic(), accessToken, refreshToken };
}

/**
 * Rotate the refresh token pair.
 * Verifies the provided refresh token against the hashed value in DB.
 * @param {string} token - Raw refresh token from cookie
 * @returns {{ accessToken: string, refreshToken: string }}
 */
async function refreshTokens(token) {
  if (!token) {
    throw new AppError('Refresh token required', 401);
  }

  // Decode to get userId (throws AppError on expired/invalid)
  const decoded = verifyRefreshToken(token);

  // Fetch user WITH hashed refresh token
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.refreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 403);
  }

  // Verify the raw token matches what we stored
  const isValid = await bcrypt.compare(token, user.refreshToken);
  if (!isValid) {
    // Possible token reuse attack — clear stored token
    await User.findByIdAndUpdate(user._id, { refreshToken: null });
    throw new AppError('Refresh token is invalid or has been reused', 401);
  }

  // Issue a new pair (old one is replaced in DB)
  return _issueTokenPair(user);
}

/**
 * Logout: clear the stored refresh token so it cannot be reused.
 * @param {string} userId
 */
async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
}

/**
 * Change authenticated user's password.
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 */
async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.password = newPassword;
  // Also invalidate existing refresh tokens so other sessions are forced to re-login
  user.refreshToken = null;
  await user.save();
}

/**
 * Get a user's public profile by ID.
 * @param {string} userId
 * @returns {object}
 */
async function getProfile(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new AppError('User not found', 404);
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Update a user's own profile (name, email).
 * @param {string} userId
 * @param {{ name?: string, email?: string }} data
 * @returns {object}
 */
async function updateProfile(userId, data) {
  // If email is changing, check for duplicates
  if (data.email) {
    const conflict = await User.findOne({ email: data.email, _id: { $ne: userId } });
    if (conflict) {
      throw new AppError('This email is already in use by another account', 409);
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  return user.toPublic();
}

/**
 * List all users (admin only) with pagination, filtering, and search.
 * @param {{ search?, role?, isActive? }} filters
 * @param {{ page?, limit?, sortBy?, sortOrder? }} pagination
 * @returns {{ users: object[], total: number, page: number, limit: number }}
 */
async function getAllUsers(filters = {}, pagination = {}) {
  const { search, role, isActive } = filters;
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(parseInt(pagination.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;

  const sortBy = pagination.sortBy || 'createdAt';
  const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return { users, total, page, limit };
}

/**
 * Toggle a user's active status (admin only).
 * Admin cannot deactivate themselves.
 * @param {string} targetUserId
 * @param {string} requestingUserId
 * @returns {object} Updated user
 */
async function toggleUserStatus(targetUserId, requestingUserId) {
  if (targetUserId === requestingUserId.toString()) {
    throw new AppError('You cannot deactivate your own account', 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) throw new AppError('User not found', 404);

  user.isActive = !user.isActive;
  await user.save({ validateModifiedOnly: true });

  return user.toPublic();
}

module.exports = {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  changePassword,
  getProfile,
  updateProfile,
  getAllUsers,
  toggleUserStatus,
};
