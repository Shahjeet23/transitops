'use strict';

const notificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/response.util');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { data, meta } = await notificationService.getUserNotifications(req.user._id, req.user.role, req.query);
  return sendPaginated(res, data, meta, 'Notifications retrieved successfully');
});

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.params.id, req.user._id);
  return sendSuccess(res, null, 'Notification marked as read');
});

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id, req.user.role);
  return sendSuccess(res, null, 'All notifications marked as read');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
