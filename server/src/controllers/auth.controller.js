'use strict';

const authService = require('../services/auth.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const asyncHandler = require('../utils/asyncHandler');

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return sendSuccess(res, { user }, 'Registration successful', 201);
});

/**
 * POST /api/auth/login
 * Returns both accessToken and refreshToken in the response body.
 * The client is responsible for storing and sending the refreshToken.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
  return sendSuccess(res, { user, accessToken, refreshToken }, 'Login successful');
});

/**
 * POST /api/auth/refresh
 * Expects { refreshToken } in the request body.
 * Returns a new { accessToken, refreshToken } pair.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const { accessToken, refreshToken } = await authService.refreshTokens(token);
  return sendSuccess(res, { accessToken, refreshToken }, 'Token refreshed successfully');
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);
  return sendSuccess(res, null, 'Logged out successfully');
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  return sendSuccess(res, { user }, 'Profile retrieved successfully');
});

/**
 * PUT /api/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user._id, currentPassword, newPassword);
  return sendSuccess(res, null, 'Password changed successfully. Please log in again.');
});

/**
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, { user }, 'Profile updated successfully');
});

// ─── Admin controllers ────────────────────────────────────────────────────────

/**
 * GET /api/auth/users
 * Query params: search, role, isActive, page, limit, sortBy, sortOrder
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive, page, limit, sortBy, sortOrder } = req.query;

  const { users, total, page: currentPage, limit: currentLimit } = await authService.getAllUsers(
    { search, role, isActive },
    { page, limit, sortBy, sortOrder }
  );

  return sendPaginated(res, users, { page: currentPage, limit: currentLimit, total }, 'Users retrieved successfully');
});

/**
 * PATCH /api/auth/users/:id/status
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await authService.toggleUserStatus(req.params.id, req.user._id);
  const action = user.isActive ? 'activated' : 'deactivated';
  return sendSuccess(res, { user }, `User ${action} successfully`);
});

/**
 * PATCH /api/auth/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const AppError = require('../utils/AppError');
  if (!role) throw new AppError('Role is required', 400);
  const user = await authService.updateUserRole(req.params.id, role, req.user._id);
  return sendSuccess(res, { user }, 'User role updated successfully');
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  updateProfile,
  getUsers,
  toggleUserStatus,
  updateUserRole,
};
