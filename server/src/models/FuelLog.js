'use strict';

const mongoose = require('mongoose');

const fuelLogSchema = new mongoose.Schema(
  {
    // ─── References ───────────────────────────────────────────────────────────
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle is required'],
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
      index: true,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true,
    },

    // ─── Fill details ─────────────────────────────────────────────────────────
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },

    liters: {
      type: Number,
      required: [true, 'Liters is required'],
      min: [0.1, 'Liters must be greater than 0'],
    },

    pricePerLiter: {
      type: Number,
      required: [true, 'Price per liter is required'],
      min: [0, 'Price cannot be negative'],
    },

    // totalCost = liters * pricePerLiter (stored for query performance)
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
    },

    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      trim: true,
    },

    // ─── Odometer ─────────────────────────────────────────────────────────────
    odometerKm: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer cannot be negative'],
    },

    // ─── Station info ─────────────────────────────────────────────────────────
    stationName: {
      type: String,
      trim: true,
      default: null,
    },

    stationLocation: {
      type: String,
      trim: true,
      default: null,
    },

    receiptNumber: {
      type: String,
      trim: true,
      default: null,
    },

    isFull: {
      type: Boolean,
      default: true, // true = full tank fill-up (used to calc efficiency)
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },

    // ─── Audit ────────────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-save: calculate totalCost ───────────────────────────────────────────
fuelLogSchema.pre('save', function () {
  if (this.isModified('liters') || this.isModified('pricePerLiter')) {
    this.totalCost = parseFloat((this.liters * this.pricePerLiter).toFixed(2));
  }
});

// ─── Indexes ─────────────────────────────────────────────────────────────────
fuelLogSchema.index({ vehicle: 1, date: -1 });
fuelLogSchema.index({ date: -1 });

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);

module.exports = FuelLog;
