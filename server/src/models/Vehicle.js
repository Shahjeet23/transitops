'use strict';

const mongoose = require('mongoose');

const VEHICLE_TYPES = ['truck', 'van', 'bus', 'car', 'motorcycle', 'trailer'];
const FUEL_TYPES    = ['diesel', 'petrol', 'electric', 'hybrid', 'cng'];
const STATUSES      = ['available', 'on_trip', 'in_maintenance', 'retired'];

const vehicleSchema = new mongoose.Schema(
  {
    // ─── Identity ───────────────────────────────────────────────────────────
    plateNumber: {
      type: String,
      required: [true, 'Plate number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    make: {
      type: String,
      required: [true, 'Make is required'],
      trim: true,
      maxlength: [60, 'Make cannot exceed 60 characters'],
    },

    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
      maxlength: [60, 'Model cannot exceed 60 characters'],
    },

    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1900, 'Year must be 1900 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },

    type: {
      type: String,
      enum: { values: VEHICLE_TYPES, message: `Type must be one of: ${VEHICLE_TYPES.join(', ')}` },
      required: [true, 'Vehicle type is required'],
    },

    // ─── Capacity & Fuel ────────────────────────────────────────────────────
    capacityKg: {
      type: Number,
      required: [true, 'Capacity (kg) is required'],
      min: [1, 'Capacity must be at least 1 kg'],
    },

    fuelType: {
      type: String,
      enum: { values: FUEL_TYPES, message: `Fuel type must be one of: ${FUEL_TYPES.join(', ')}` },
      required: [true, 'Fuel type is required'],
    },

    fuelCapacityLiters: {
      type: Number,
      min: [0, 'Fuel capacity cannot be negative'],
      default: null,
    },

    // ─── Odometer ────────────────────────────────────────────────────────────
    currentOdometerKm: {
      type: Number,
      default: 0,
      min: [0, 'Odometer cannot be negative'],
    },

    // ─── Status ──────────────────────────────────────────────────────────────
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

    // ─── Compliance dates ─────────────────────────────────────────────────────
    insuranceExpiry: {
      type: Date,
      default: null,
    },

    registrationExpiry: {
      type: Date,
      default: null,
    },

    purchaseDate: {
      type: Date,
      default: null,
    },

    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
      default: null,
    },

    // ─── Current assignment ───────────────────────────────────────────────────
    currentDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    currentTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },

    // ─── Extra ───────────────────────────────────────────────────────────────
    color: {
      type: String,
      trim: true,
      maxlength: [30, 'Color cannot exceed 30 characters'],
      default: null,
    },

    vin: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true, // allows multiple null values with unique index
      default: null,
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
vehicleSchema.index({ status: 1, isActive: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ insuranceExpiry: 1 });
vehicleSchema.index({ registrationExpiry: 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** True if insurance expires within 30 days */
vehicleSchema.virtual('isInsuranceExpiringSoon').get(function () {
  if (!this.insuranceExpiry) return false;
  const diffMs = this.insuranceExpiry - Date.now();
  return diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000;
});

/** True if registration expires within 30 days */
vehicleSchema.virtual('isRegistrationExpiringSoon').get(function () {
  if (!this.registrationExpiry) return false;
  const diffMs = this.registrationExpiry - Date.now();
  return diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000;
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
module.exports.VEHICLE_TYPES = VEHICLE_TYPES;
module.exports.FUEL_TYPES = FUEL_TYPES;
module.exports.VEHICLE_STATUSES = STATUSES;
