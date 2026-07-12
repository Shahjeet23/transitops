'use strict';

const Expense = require('../models/Expense');
const AppError = require('../utils/AppError');

/**
 * Get all expenses with pagination and filters
 */
async function getExpenses(query) {
  const { page = 1, limit = 10, category, status, startDate, endDate, vehicleId } = query;

  const filter = {};

  if (category) filter.category = category;
  if (status) filter.status = status;
  if (vehicleId) filter.vehicle = vehicleId;
  
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Expense.find(filter)
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'name')
      .populate('trip', 'route')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Expense.countDocuments(filter),
  ]);

  return {
    data,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get expense by ID
 */
async function getExpenseById(id) {
  const expense = await Expense.findById(id)
    .populate('vehicle', 'plateNumber make model')
    .populate('driver', 'name')
    .populate('trip', 'route')
    .populate('createdBy', 'name email')
    .populate('approvedBy', 'name email')
    .lean();

  if (!expense) {
    throw new AppError('Expense not found', 404);
  }
  return expense;
}

/**
 * Create a new expense (status: pending)
 */
async function createExpense(data, userId) {
  data.createdBy = userId;
  data.status = 'pending';

  const expense = await Expense.create(data);
  return expense;
}

/**
 * Update an existing expense (only if pending)
 */
async function updateExpense(id, data) {
  const expense = await Expense.findById(id);
  
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  if (expense.status !== 'pending') {
    throw new AppError(`Cannot update expense in ${expense.status} status`, 400);
  }

  const updatedExpense = await Expense.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedExpense;
}

/**
 * Approve an expense
 */
async function approveExpense(id, userId) {
  const expense = await Expense.findById(id);
  
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  if (expense.status !== 'pending') {
    throw new AppError(`Expense is already ${expense.status}`, 400);
  }

  expense.status = 'approved';
  expense.approvedBy = userId;
  expense.approvedAt = new Date();
  
  await expense.save();

  return expense;
}

/**
 * Reject an expense
 */
async function rejectExpense(id, reason, userId) {
  const expense = await Expense.findById(id);
  
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  if (expense.status !== 'pending') {
    throw new AppError(`Expense is already ${expense.status}`, 400);
  }

  if (!reason) {
    throw new AppError('Rejection reason is required', 400);
  }

  expense.status = 'rejected';
  expense.rejectionReason = reason;
  // We can track who rejected it in approvedBy/rejectedBy, but currently schema has only approvedBy.
  // Storing the ID in notes or creating a rejectedBy field is best. We'll add it to notes.
  expense.notes = expense.notes ? `${expense.notes}\nRejected by user: ${userId}` : `Rejected by user: ${userId}`;
  
  await expense.save();

  return expense;
}

/**
 * Delete an expense
 */
async function deleteExpense(id) {
  const expense = await Expense.findById(id);
  if (!expense) {
    throw new AppError('Expense not found', 404);
  }

  if (expense.status === 'approved') {
    throw new AppError('Cannot delete an approved expense', 400);
  }

  await expense.deleteOne();
  return null;
}

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  approveExpense,
  rejectExpense,
  deleteExpense,
};
