'use strict';

const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');

async function createNotification(data) {
  // data: { title, message, type, recipientRole, recipientUser }
  const notification = await Notification.create(data);
  return notification;
}

async function getUserNotifications(userId, userRole, pagination = {}) {
  const page = Math.max(parseInt(pagination.page, 10) || 1, 1);
  const limit = Math.min(parseInt(pagination.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  // Find notifications addressed to the user specifically, OR to their role, OR 'all'
  const query = {
    $or: [
      { recipientUser: userId },
      { recipientRole: userRole },
      { recipientRole: 'all' }
    ]
  };

  const [data, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  // For each notification, add a boolean `isRead` flag
  const formattedData = data.map(n => ({
    ...n,
    isRead: n.readBy && n.readBy.some(id => id.toString() === userId.toString())
  }));

  const unreadCount = await Notification.countDocuments({
    ...query,
    readBy: { $ne: userId }
  });

  return {
    data: formattedData,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      unreadCount
    }
  };
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findById(notificationId);
  if (!notification) throw new AppError('Notification not found', 404);

  // Avoid duplicates
  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
    await notification.save();
  }
  return notification;
}

async function markAllAsRead(userId, userRole) {
  const query = {
    $or: [
      { recipientUser: userId },
      { recipientRole: userRole },
      { recipientRole: 'all' }
    ],
    readBy: { $ne: userId }
  };

  await Notification.updateMany(query, {
    $addToSet: { readBy: userId }
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
