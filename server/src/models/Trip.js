'use strict';

const mongoose = require('mongoose');

const TRIP_STATUSES = ['draft', 'dispatched', 'in_progress', 'completed', 'cancelled'];

const locationSchema = new mongoose.Schema(
  {
    address:   { type: String, required: true, trim: true },
    city:      { type: String, trim: true, default: null },
    state:     { type: String, trim: true, default: null },
    country:   { type: String, trim: true, default: null },
    latitude:  { type: Number, default: null },
    longitude: { type: Number, default: null },
  },
  { _id: false }
);

const cargoSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true, default: null },
    weightKg:    { type: Number, min: [0, 'Weight cannot be negative'], default: 0 },
    unit:        { type: String, enum: ['kg', 'ton', 'piece'], default: 'kg' },
    quantity:    { type: Number, min: [0, 'Quantity cannot be negative'], default: null },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    // ─── Auto-generated trip number ───────────────────────────────────────────
    tripNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // ─── Status lifecycle ─────────────────────────────────────────────────────
    status: {
      type: String,
      enum: { values: TRIP_STATUSES, message: `Status must be one of: ${TRIP_STATUSES.join(', ')}` },
      default: 'draft',
      index: true,
    },

    // ─── Assignments ──────────────────────────────────────────────────────────
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Driver is required'],
      index: true,
    },

    // ─── Route ────────────────────────────────────────────────────────────────
    origin:      { type: locationSchema, required: [true, 'Origin is required'] },
    destination: { type: locationSchema, required: [true, 'Destination is required'] },
    distanceKm:  { type: Number, min: [0, 'Distance cannot be negative'], default: null },
    routeUrl:    { type: String, trim: true, default: null },

    // ─── Schedule ─────────────────────────────────────────────────────────────
    scheduledDeparture: {
      type: Date,
      required: [true, 'Scheduled departure is required'],
    },
    actualDeparture: {
      type: Date,
      default: null,
    },
    scheduledArrival: {
      type: Date,
      default: null,
    },
    actualArrival: {
      type: Date,
      default: null,
    },

    // ─── Cargo ────────────────────────────────────────────────────────────────
    cargo: { type: cargoSchema, default: () => ({}) },

    // ─── Financials ───────────────────────────────────────────────────────────
    revenue: {
      type: Number,
      min: [0, 'Revenue cannot be negative'],
      default: 0,
    },

    // ─── Odometer snapshots ───────────────────────────────────────────────────
    odometerStart: { type: Number, min: [0], default: null },
    odometerEnd:   { type: Number, min: [0], default: null },

    // ─── Cancellation ─────────────────────────────────────────────────────────
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
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

    dispatchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    completedBy: {
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
tripSchema.index({ status: 1, scheduledDeparture: -1 });
tripSchema.index({ vehicle: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ createdAt: -1 });

// ─── Pre-save: auto-generate tripNumber ───────────────────────────────────────
tripSchema.pre('save', async function () {
  if (this.isNew && !this.tripNumber) {
    const count = await this.constructor.countDocuments();
    const pad   = String(count + 1).padStart(6, '0');
    this.tripNumber = `TRP-${pad}`;
  }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────

/** Actual duration in minutes (only if both timestamps exist) */
tripSchema.virtual('durationMinutes').get(function () {
  if (!this.actualDeparture || !this.actualArrival) return null;
  return Math.round((this.actualArrival - this.actualDeparture) / 60_000);
});

/** Actual distance driven (odometer diff) */
tripSchema.virtual('actualDistanceKm').get(function () {
  if (this.odometerStart == null || this.odometerEnd == null) return null;
  return this.odometerEnd - this.odometerStart;
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
module.exports.TRIP_STATUSES = TRIP_STATUSES;
