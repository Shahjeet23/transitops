'use strict';

const mongoose = require('mongoose');

const LICENSE_TYPES = ['A', 'B', 'C', 'D', 'E'];
const STATUSES      = ['available', 'on_trip', 'off_duty', 'suspended'];

const driverSchema = new mongoose.Schema(
  {
    // ─── Personal info ────────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
      index: true,
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[+]?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'],
    },

    dateOfBirth: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow null
          const age = (Date.now() - v.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          return age >= 18;
        },
        message: 'Driver must be at least 18 years old',
      },
    },

    address: {
      street:  { type: String, trim: true, default: null },
      city:    { type: String, trim: true, default: null },
      state:   { type: String, trim: true, default: null },
      country: { type: String, trim: true, default: null },
      pincode: { type: String, trim: true, default: null },
    },

    // ─── License ──────────────────────────────────────────────────────────────
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    licenseType: {
      type: String,
      enum: {
        values: LICENSE_TYPES,
        message: `License type must be one of: ${LICENSE_TYPES.join(', ')}`,
      },
      required: [true, 'License type is required'],
    },

    licenseExpiry: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },

    // ─── Employment ───────────────────────────────────────────────────────────
    joinDate: {
      type: Date,
      default: Date.now,
    },

    experienceYears: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },

    // ─── Status ───────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: { values: STATUSES, message: `Status must be one of: ${STATUSES.join(', ')}` },
      default: 'available',
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ─── Current assignment ───────────────────────────────────────────────────
    currentVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },

    currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    // ─── Emergency contact ────────────────────────────────────────────────────
    emergencyContact: {
      name:     { type: String, trim: true, default: null },
      phone:    { type: String, trim: true, default: null },
      relation: { type: String, trim: true, default: null },
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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
driverSchema.index({ status: 1, isActive: 1 });
driverSchema.index({ licenseExpiry: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** True if license has expired */
driverSchema.virtual('isLicenseExpired').get(function () {
  return this.licenseExpiry ? this.licenseExpiry < new Date() : false;
});

/** True if license expires within 30 days */
driverSchema.virtual('isLicenseExpiringSoon').get(function () {
  if (!this.licenseExpiry) return false;
  const diffMs = this.licenseExpiry - Date.now();
  return diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000;
});

/** Age in years (approximate) */
driverSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
module.exports.LICENSE_TYPES = LICENSE_TYPES;
module.exports.DRIVER_STATUSES = STATUSES;
