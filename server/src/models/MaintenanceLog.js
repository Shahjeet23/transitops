'use strict';

const mongoose = require('mongoose');

const MAINTENANCE_TYPES    = ['preventive', 'corrective', 'emergency'];
const MAINTENANCE_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const partSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
    unitCost: { type: Number, required: true, min: [0, 'Cost cannot be negative'] },
  },
  { _id: false }
);

partSchema.virtual('totalCost').get(function () {
  return this.quantity * this.unitCost;
});

const maintenanceLogSchema = new mongoose.Schema(
  {
    // ─── Vehicle reference ────────────────────────────────────────────────────
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
      index: true,
    },

    // ─── Type & Status ────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: { values: MAINTENANCE_TYPES, message: `Type must be one of: ${MAINTENANCE_TYPES.join(', ')}` },
      required: [true, 'Maintenance type is required'],
    },

    status: {
      type: String,
      enum: { values: MAINTENANCE_STATUSES, message: `Status must be one of: ${MAINTENANCE_STATUSES.join(', ')}` },
      default: 'scheduled',
      index: true,
    },

    // ─── Description ─────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: null,
    },

    diagnosis: {
      type: String,
      trim: true,
      maxlength: [2000, 'Diagnosis cannot exceed 2000 characters'],
      default: null,
    },

    // ─── Dates ────────────────────────────────────────────────────────────────
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },

    startDate: {
      type: Date,
      default: null,
    },

    completedDate: {
      type: Date,
      default: null,
    },

    // ─── Odometer at service ──────────────────────────────────────────────────
    mileageAtServiceKm: {
      type: Number,
      min: [0, 'Mileage cannot be negative'],
      default: null,
    },

    // ─── Costs ────────────────────────────────────────────────────────────────
    parts: {
      type: [partSchema],
      default: [],
    },

    laborCost: {
      type: Number,
      min: [0, 'Labor cost cannot be negative'],
      default: 0,
    },

    otherCosts: {
      type: Number,
      min: [0, 'Other costs cannot be negative'],
      default: 0,
    },

    // ─── Service provider ─────────────────────────────────────────────────────
    serviceProvider: {
      name:    { type: String, trim: true, default: null },
      contact: { type: String, trim: true, default: null },
      address: { type: String, trim: true, default: null },
    },

    // ─── Next service reminder ────────────────────────────────────────────────
    nextServiceDate: {
      type: Date,
      default: null,
    },

    nextServiceKm: {
      type: Number,
      min: [0],
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: null,
    },

    // ─── Audit ────────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
maintenanceLogSchema.index({ vehicle: 1, status: 1 });
maintenanceLogSchema.index({ scheduledDate: 1 });
maintenanceLogSchema.index({ status: 1, type: 1 });

// ─── Virtual: total cost ──────────────────────────────────────────────────────
maintenanceLogSchema.virtual('totalCost').get(function () {
  const partsCost = this.parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
  return partsCost + this.laborCost + this.otherCosts;
});

// ─── Virtual: parts cost subtotal ────────────────────────────────────────────
maintenanceLogSchema.virtual('partsCost').get(function () {
  return this.parts.reduce((sum, p) => sum + p.quantity * p.unitCost, 0);
});

const MaintenanceLog = mongoose.model('MaintenanceLog', maintenanceLogSchema);

module.exports = MaintenanceLog;
module.exports.MAINTENANCE_TYPES    = MAINTENANCE_TYPES;
module.exports.MAINTENANCE_STATUSES = MAINTENANCE_STATUSES;
