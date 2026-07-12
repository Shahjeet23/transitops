'use strict';

const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/auth.validator');

// ─── Public routes (no auth required) ────────────────────────────────────────

// POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/refresh  (token comes from HttpOnly cookie)
router.post('/refresh', authController.refresh);

// ─── Protected routes (JWT required) ─────────────────────────────────────────

// POST /api/auth/logout
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

// PUT /api/auth/profile
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

// ─── Admin-only routes ────────────────────────────────────────────────────────

// GET /api/auth/users
router.get('/users', authenticate, authorize('admin'), authController.getUsers);

// PATCH /api/auth/users/:id/status
router.patch('/users/:id/status', authenticate, authorize('admin'), authController.toggleUserStatus);

module.exports = router;
