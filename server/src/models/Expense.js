'use strict';

const mongoose = require('mongoose');

const EXPENSE_CATEGORIES = [
  'fuel',
  'maintenance',
  'toll',
  'insurance',
  'registration',
  'salary',
  'tyre',
  'cleaning',
  'parking',
  'fine',
  'other',
];

const EXPENSE_STATUSES  = ['pending', 'approved', 'rejected'];
const PAYMENT_METHODS   = ['cash', 'card', 'bank_transfer', 'upi', 'cheque'];

const expenseSchema = new mongoose.Schema(
  {
    // ─── Optional references (at least one recommended) ───────────────────────
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },

    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
      index: true,
    },

    // ─── Core fields ──────────────────────────────────────────────────────────
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Category is required'],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    // ─── Receipt / payment ────────────────────────────────────────────────────
    receiptNumber: {
      type: String,
      trim: true,
      default: null,
    },

    vendor: {
      type: String,
      trim: true,
      maxlength: [200, 'Vendor name cannot exceed 200 characters'],
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: `Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`,
      },
      default: 'cash',
    },

    // ─── Approval workflow ────────────────────────────────────────────────────
    status: {
      type: String,
      enum: { values: EXPENSE_STATUSES, message: `Status must be one of: ${EXPENSE_STATUSES.join(', ')}` },
      default: 'pending',
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
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

// ─── Indexes ──────────────────────────────────────────────────────────────────
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ status: 1, date: -1 });
expenseSchema.index({ vehicle: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
module.exports.EXPENSE_STATUSES   = EXPENSE_STATUSES;
module.exports.PAYMENT_METHODS    = PAYMENT_METHODS;
