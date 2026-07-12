const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String, // 'trip', 'maintenance', 'system', 'fuel'
    required: true,
  },
  recipientRole: {
    type: String, // 'admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst', 'all'
    required: false,
  },
  recipientUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

// Index for efficient querying
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientUser: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
