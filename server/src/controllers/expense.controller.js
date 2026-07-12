'use strict';

const expenseService = require('../services/expense.service');

/**
 * @desc    Get all expenses
 * @route   GET /api/expenses
 * @access  Private
 */
exports.getExpenses = async (req, res, next) => {
  try {
    const result = await expenseService.getExpenses(req.query);
    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get expense by ID
 * @route   GET /api/expenses/:id
 * @access  Private
 */
exports.getExpenseById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create expense
 * @route   POST /api/expenses
 * @access  Private
 */
exports.createExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body, req.user._id);
    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update expense
 * @route   PUT /api/expenses/:id
 * @access  Private
 */
exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve expense
 * @route   PUT /api/expenses/:id/approve
 * @access  Private (Admin, Fleet Manager, Financial Analyst)
 */
exports.approveExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.approveExpense(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject expense
 * @route   PUT /api/expenses/:id/reject
 * @access  Private (Admin, Fleet Manager, Financial Analyst)
 */
exports.rejectExpense = async (req, res, next) => {
  try {
    const expense = await expenseService.rejectExpense(req.params.id, req.body.rejectionReason, req.user._id);
    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense rejected',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete expense
 * @route   DELETE /api/expenses/:id
 * @access  Private (Admin)
 */
exports.deleteExpense = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    res.status(200).json({
      success: true,
      data: {},
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
