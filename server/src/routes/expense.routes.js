'use strict';

const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

// View routes open to all authenticated users
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);

// Create / Update routes (any authenticated user can create/update, but only if pending)
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);

// Approval workflows (Managers, Admins, Analysts)
const approvers = authorize('admin', 'fleet_manager', 'financial_analyst');
router.put('/:id/approve', approvers, expenseController.approveExpense);
router.put('/:id/reject', approvers, expenseController.rejectExpense);

// Delete (Admin only)
router.delete('/:id', authorize('admin'), expenseController.deleteExpense);

module.exports = router;
